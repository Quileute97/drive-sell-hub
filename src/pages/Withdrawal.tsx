import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  XCircle,
  DollarSign,
  Building2
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

interface BankAccount {
  id: string;
  bank_name: string;
  account_number: string;
  account_holder_name: string;
  branch?: string;
  is_primary: boolean;
  is_verified: boolean;
  created_at: string;
}

interface WithdrawalRequest {
  id: string;
  amount: number;
  fee: number;
  net_amount: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  requested_at: string;
  processed_at?: string;
  rejected_reason?: string;
  bank_accounts: BankAccount;
}

export default function Withdrawal() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddBank, setShowAddBank] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBankToDelete, setSelectedBankToDelete] = useState<string>('');

  const [bankForm, setBankForm] = useState({
    bank_name: '',
    account_number: '',
    account_holder_name: '',
    branch: ''
  });

  // Realtime subscription for withdrawal status updates
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel('withdrawal-status-updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'withdrawal_requests',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          // Refresh withdrawals when status changes
          queryClient.invalidateQueries({ queryKey: ['withdrawals', user.id] });
          queryClient.invalidateQueries({ queryKey: ['seller-balance', user.id] });
          
          // Show toast notification based on new status
          const newStatus = payload.new.status;
          if (newStatus === 'completed') {
            toast({
              title: "Rút tiền thành công!",
              description: "Yêu cầu rút tiền của bạn đã được xử lý thành công.",
            });
          } else if (newStatus === 'rejected') {
            toast({
              title: "Yêu cầu bị từ chối",
              description: payload.new.rejected_reason || "Yêu cầu rút tiền của bạn đã bị từ chối.",
              variant: "destructive",
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id, queryClient, toast]);

  // Fetch available balance
  const { data: balanceData } = useQuery({
    queryKey: ['seller-balance', user?.id],
    queryFn: async () => {
      if (!user?.id) return { available: 0, pending: 0, total: 0 };
      
      const { data: orders, error } = await (supabase as any).rpc('get_seller_order_amounts');

      if (error) throw error;

      const completed = orders?.filter(o => o.status === 'delivered') || [];
      const pending = orders?.filter(o => o.status === 'paid') || [];
      
      const available = completed.reduce((sum, o) => sum + Number(o.seller_amount), 0);
      const pendingAmount = pending.reduce((sum, o) => sum + Number(o.seller_amount), 0);

      // Subtract withdrawn amounts
      const { data: withdrawals } = await supabase
        .from('withdrawal_requests')
        .select('net_amount')
        .eq('user_id', user.id)
        .in('status', ['completed', 'processing', 'pending']);

      const withdrawn = withdrawals?.reduce((sum, w) => sum + Number(w.net_amount), 0) || 0;

      return {
        available: available - withdrawn,
        pending: pendingAmount,
        total: available + pendingAmount
      };
    },
    enabled: !!user?.id
  });

  // Fetch bank accounts
  const { data: bankAccounts = [] } = useQuery({
    queryKey: ['bank-accounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('bank_accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false });

      if (error) throw error;
      return data as BankAccount[];
    },
    enabled: !!user?.id
  });

  // Fetch withdrawal history
  const { data: withdrawals = [] } = useQuery({
    queryKey: ['withdrawals', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('withdrawal_requests')
        .select(`
          *,
          bank_accounts(*)
        `)
        .eq('user_id', user.id)
        .order('requested_at', { ascending: false });

      if (error) throw error;
      return data as WithdrawalRequest[];
    },
    enabled: !!user?.id
  });

  const addBankMutation = useMutation({
    mutationFn: async (data: typeof bankForm) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('bank_accounts')
        .insert({
          user_id: user.id,
          ...data,
          is_primary: bankAccounts.length === 0
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({
        title: "Thành công",
        description: "Đã thêm tài khoản ngân hàng"
      });
      setShowAddBank(false);
      setBankForm({
        bank_name: '',
        account_number: '',
        account_holder_name: '',
        branch: ''
      });
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể thêm tài khoản ngân hàng",
        variant: "destructive"
      });
    }
  });

  const deleteBankMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('bank_accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bank-accounts'] });
      toast({
        title: "Thành công",
        description: "Đã xóa tài khoản ngân hàng"
      });
      setDeleteDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể xóa tài khoản ngân hàng",
        variant: "destructive"
      });
    }
  });

  const withdrawMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !selectedBank || !withdrawAmount) {
        throw new Error('Missing required fields');
      }

      const amount = parseFloat(withdrawAmount);
      if (amount <= 0 || amount > (balanceData?.available || 0)) {
        throw new Error('Invalid amount');
      }

      const fee = amount * 0.01; // 1% fee
      const netAmount = amount - fee;

      const { error } = await supabase
        .from('withdrawal_requests')
        .insert({
          user_id: user.id,
          bank_account_id: selectedBank,
          amount,
          fee,
          net_amount: netAmount
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['seller-balance'] });
      toast({
        title: "Thành công",
        description: "Yêu cầu rút tiền đã được gửi"
      });
      setShowWithdrawDialog(false);
      setWithdrawAmount('');
      setSelectedBank('');
    },
    onError: (error: any) => {
      toast({
        title: "Lỗi",
        description: error.message || "Không thể tạo yêu cầu rút tiền",
        variant: "destructive"
      });
    }
  });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('vi-VN');
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: any; icon: any; label: string; className?: string }> = {
      pending: { variant: 'secondary', icon: Clock, label: 'Chờ xử lý' },
      processing: { variant: 'default', icon: Clock, label: 'Đang xử lý' },
      completed: { variant: 'default', icon: CheckCircle2, label: 'Rút tiền thành công', className: 'bg-green-600 text-white hover:bg-green-700' },
      rejected: { variant: 'destructive', icon: XCircle, label: 'Từ chối' }
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className={`flex items-center gap-1 ${config.className || ''}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Số dư khả dụng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPrice(balanceData?.available || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Có thể rút ngay
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Đang chờ xử lý
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {formatPrice(balanceData?.pending || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Từ đơn hàng mới
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tổng doanh thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatPrice(balanceData?.total || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tổng cộng
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="withdraw" className="space-y-4">
        <TabsList>
          <TabsTrigger value="withdraw">Rút tiền</TabsTrigger>
          <TabsTrigger value="bank-accounts">Tài khoản ngân hàng</TabsTrigger>
          <TabsTrigger value="history">Lịch sử</TabsTrigger>
        </TabsList>

        <TabsContent value="withdraw" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yêu cầu rút tiền</CardTitle>
              <CardDescription>
                Rút số dư khả dụng về tài khoản ngân hàng của bạn
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bankAccounts.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground mb-4">
                    Bạn cần thêm tài khoản ngân hàng trước khi rút tiền
                  </p>
                  <Button onClick={() => setShowAddBank(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Thêm tài khoản ngân hàng
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <Button 
                    onClick={() => setShowWithdrawDialog(true)}
                    disabled={(balanceData?.available || 0) <= 0}
                    size="lg"
                    className="w-full"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Tạo yêu cầu rút tiền
                  </Button>
                  {(balanceData?.available || 0) <= 0 && (
                    <p className="text-sm text-muted-foreground text-center">
                      Số dư khả dụng của bạn là 0₫. Số dư chỉ khả dụng sau khi đơn hàng được đánh dấu "Đã giao".
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bank-accounts" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Tài khoản ngân hàng</h3>
            <Button onClick={() => setShowAddBank(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm tài khoản
            </Button>
          </div>

          <div className="grid gap-4">
            {bankAccounts.map((account) => (
              <Card key={account.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <CreditCard className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold">{account.bank_name}</h4>
                          {account.is_primary && (
                            <Badge variant="secondary">Chính</Badge>
                          )}
                          {account.is_verified && (
                            <Badge variant="default">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Đã xác minh
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {account.account_holder_name}
                        </p>
                        <p className="text-sm font-mono">
                          {account.account_number}
                        </p>
                        {account.branch && (
                          <p className="text-sm text-muted-foreground">
                            Chi nhánh: {account.branch}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedBankToDelete(account.id);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}

            {bankAccounts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có tài khoản ngân hàng</h3>
                  <p className="text-muted-foreground mb-4">
                    Thêm tài khoản ngân hàng để nhận tiền rút
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <h3 className="text-lg font-semibold">Lịch sử rút tiền</h3>

          <div className="grid gap-4">
            {withdrawals.map((withdrawal) => (
              <Card key={withdrawal.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {formatPrice(withdrawal.amount)}
                        </span>
                        {getStatusBadge(withdrawal.status)}
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p>
                          Phí: {formatPrice(withdrawal.fee)} | 
                          Nhận: <span className="font-medium text-foreground">
                            {formatPrice(withdrawal.net_amount)}
                          </span>
                        </p>
                        <p>
                          {withdrawal.bank_accounts.bank_name} - {withdrawal.bank_accounts.account_number}
                        </p>
                        <p>Yêu cầu: {formatDate(withdrawal.requested_at)}</p>
                        {withdrawal.processed_at && (
                          <p>Xử lý: {formatDate(withdrawal.processed_at)}</p>
                        )}
                        {withdrawal.rejected_reason && (
                          <p className="text-destructive">
                            Lý do từ chối: {withdrawal.rejected_reason}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {withdrawals.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <DollarSign className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Chưa có lịch sử rút tiền</h3>
                  <p className="text-muted-foreground">
                    Lịch sử rút tiền sẽ hiển thị ở đây
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Bank Account Dialog */}
      <Dialog open={showAddBank} onOpenChange={setShowAddBank}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Thêm tài khoản ngân hàng</DialogTitle>
            <DialogDescription>
              Nhập thông tin tài khoản ngân hàng để nhận tiền rút
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bank-name">Tên ngân hàng *</Label>
              <Input
                id="bank-name"
                placeholder="Vietcombank, Techcombank, ..."
                value={bankForm.bank_name}
                onChange={(e) => setBankForm(prev => ({ ...prev, bank_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="account-number">Số tài khoản *</Label>
              <Input
                id="account-number"
                placeholder="1234567890"
                value={bankForm.account_number}
                onChange={(e) => setBankForm(prev => ({ ...prev, account_number: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="account-holder">Tên chủ tài khoản *</Label>
              <Input
                id="account-holder"
                placeholder="NGUYEN VAN A"
                value={bankForm.account_holder_name}
                onChange={(e) => setBankForm(prev => ({ ...prev, account_holder_name: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="branch">Chi nhánh (không bắt buộc)</Label>
              <Input
                id="branch"
                placeholder="Chi nhánh Hà Nội"
                value={bankForm.branch}
                onChange={(e) => setBankForm(prev => ({ ...prev, branch: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBank(false)}>
              Hủy
            </Button>
            <Button 
              onClick={() => addBankMutation.mutate(bankForm)}
              disabled={!bankForm.bank_name || !bankForm.account_number || !bankForm.account_holder_name}
            >
              Thêm tài khoản
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tạo yêu cầu rút tiền</DialogTitle>
            <DialogDescription>
              Số dư khả dụng: {formatPrice(balanceData?.available || 0)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="bank-select">Tài khoản ngân hàng *</Label>
              <select
                id="bank-select"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
              >
                <option value="">Chọn tài khoản</option>
                {bankAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bank_name} - {account.account_number}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label htmlFor="amount">Số tiền rút *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                max={balanceData?.available || 0}
              />
              {withdrawAmount && (
                <p className="text-sm text-muted-foreground mt-2">
                  Phí: {formatPrice(parseFloat(withdrawAmount) * 0.01)} (1%) <br />
                  Bạn sẽ nhận: {formatPrice(parseFloat(withdrawAmount) * 0.99)}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Hủy
            </Button>
            <Button 
              onClick={() => withdrawMutation.mutate()}
              disabled={!selectedBank || !withdrawAmount || parseFloat(withdrawAmount) <= 0}
            >
              Xác nhận rút tiền
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Bank Account Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài khoản ngân hàng này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteBankMutation.mutate(selectedBankToDelete)}>
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
