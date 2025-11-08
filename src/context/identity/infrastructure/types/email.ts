export interface ClerkEmailCreatedEvent {
  object: 'event';
  type: 'email.created';
  timestamp: number;
  instance_id: string;
  event_attributes: {
    http_request: {
      client_ip: string;
      user_agent: string;
    };
  };
  data: {
    object: 'email';
    id: string;
    status: 'queued' | 'sent' | 'delivered' | 'failed';
    slug: string;
    subject: string;
    body: string; // HTML
    body_plain: string; // Texto plano
    to_email_address: string;
    email_address_id: string;
    user_id: string;
    from_email_name: string;
    delivered_by_clerk: boolean;
    data: {
      app: {
        domain_name: string;
        logo_image_url: string | null;
        logo_url: string | null;
        name: string;
        url: string;
      };
      otp_code?: string;
      requested_at?: string;
      requested_by?: string;
      theme?: {
        button_text_color: string;
        primary_color: string;
        show_clerk_branding: boolean;
      };
      user: {
        public_metadata: Record<string, any>;
        public_metadata_fallback: string;
      };
    };
  };
}
