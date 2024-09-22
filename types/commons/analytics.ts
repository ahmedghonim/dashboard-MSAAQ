// Products
export type ProductsCharts = {
  courses: TopSellingProducts[];
  products: TopSellingProducts[];
};

export type TopSellingProducts = {
  item_id: number;
  item_title: string;
  sales: string;
};

// Orders
export type OrdersStats = {
  average_orders: number;
  earnings: number;
  orders: number;
  coupons: number;
  average_items: number;
  payment_methods: Array<{
    label: string;
    value: number;
  }>;
};

export interface OrderChart {
  aggregate: number;
  date: string;
}

export type OrdersChart = {
  orders: OrderChart[];
};

// Customers
export type CampaignsStats = {
  newsletter_subscribed_count: number;
  newsletter_unsubscribed_count: number;
  open_rate: number;
  click_rate: number;
  unsubscribe_rate: number;
  bounce_rate: number;
  sent_campaigns_count: number;
};

export type CustomersStats = {
  students: number;
  enrollments: number;
  rating: number;
  members_coupon: number;
  average_orders: number;
  average_totals: number;
};

// Visits
export type VisitsStats = {
  users: number;
  page_views: number;
  active_users: number;
  sessions: number;
  average_sessions: number;
  bounce_rate: number;
};
export type SessionsStats = {
  sessions: number;
  countries: Array<{
    country: string;
    total: number;
  }>;
  devices: Array<{
    device: string;
    total: number;
  }>;
};
export type MostVisited = Array<{
  most_visited_page: string;
  total: number;
}>;
export type TopReferrers = Array<{
  page_referrer: string;
  total: number;
}>;

export interface MemberDataChart {
  aggregate: number;
  date: string;
}

export type MembersChart = {
  members: MemberDataChart[];
};

export type MembersCountry = {
  countries_data: {
    [countryName: string]: {
      members_count: number;
      percentage: number;
    };
  };
};
