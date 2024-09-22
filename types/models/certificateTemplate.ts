export type CertificateTemplate = {
  id: number;
  name: string;
  theme: string;
  size: string;
  content: {
    title: string;
    issued: string;
    serial: string;
    teacher: string;
    subtitle: string;
    course_name: string;
    certificate_cause: string;
    verify_certificate: string;
  };
  design: {
    font_family: string;
    primary_color: string;
    paragraph_color: string;
    secondary_color: string;
  };
  logo: any;
  background: any;
  courses_count: number;
  created_at: string;
  updated_at: string;
};
