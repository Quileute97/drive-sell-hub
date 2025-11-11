import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface FAQ {
  question: string;
  answer: string;
}

interface ProductFAQProps {
  productName: string;
  category: string;
  fileFormat?: string;
}

export const ProductFAQ = ({ productName, category, fileFormat }: ProductFAQProps) => {
  // Generate common FAQs based on product type
  const faqs: FAQ[] = [
    {
      question: `${productName} có định dạng file gì?`,
      answer: fileFormat 
        ? `Sản phẩm được cung cấp ở định dạng ${fileFormat}. Bạn có thể tải xuống và sử dụng ngay sau khi thanh toán thành công.`
        : `Sản phẩm được cung cấp ở định dạng digital, bạn có thể tải xuống ngay sau khi thanh toán thành công.`
    },
    {
      question: "Tôi nhận sản phẩm như thế nào sau khi mua?",
      answer: "Sau khi thanh toán thành công, bạn sẽ nhận được link Google Drive để tải sản phẩm về. Link này sẽ được gửi qua email và hiển thị ngay trên trang xác nhận đơn hàng."
    },
    {
      question: "Sản phẩm có được cập nhật không?",
      answer: "Tùy thuộc vào người bán, một số sản phẩm sẽ được cập nhật định kỳ. Bạn nên liên hệ trực tiếp với người bán để biết thêm chi tiết về chính sách cập nhật."
    },
    {
      question: "Tôi có thể hoàn tiền không?",
      answer: "Chính sách hoàn tiền phụ thuộc vào từng người bán. Vui lòng đọc kỹ mô tả sản phẩm hoặc liên hệ với người bán trước khi mua để biết về chính sách hoàn tiền cụ thể."
    },
    {
      question: "Có hỗ trợ sau khi mua không?",
      answer: "Người bán thường cung cấp hỗ trợ cho sản phẩm của họ. Bạn có thể liên hệ trực tiếp với người bán thông qua thông tin được cung cấp trong email xác nhận hoặc trong file sản phẩm."
    }
  ];

  // Generate structured data for FAQPage
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  return (
    <section className="space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Câu hỏi thường gặp
        </h2>
        <p className="text-muted-foreground">
          Các câu hỏi phổ biến về {productName}
        </p>
      </div>

      <Accordion type="single" collapsible className="w-full">
        {faqs.map((faq, index) => (
          <AccordionItem key={index} value={`item-${index}`}>
            <AccordionTrigger className="text-left">
              {faq.question}
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">
              {faq.answer}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
};
