export interface PaddleEventCallback {
  event: PaddleEvent;
  eventData: {
    payment_method?: string;
    available_payment_methods?: string;
    available_payment_methods_count?: number;
    checkout: {
      id: string;
      redirect_url: string;
      completed: boolean;
      created_at: string;
      passthrough: string;
      coupon: {
        coupon_code: string;
      };
      recurring_prices: {
        customer: Customer;
        interval: {
          type: string;
          length: number;
        };
      };
      prices: {
        customer: Customer;
      };
    };
    product: { id: number; name: string; quantity: number };
    user: { id: string; email: string; country: string };
  };
  checkoutData: {
    'paddlejs-version': '2.0.9';
    apple_pay_enabled: string;
    display_mode: string;
    guest_email: string;
    is_popup: string;
    method: string;
    paddle_js: string;
    parentURL: string;
    parent_url: string;
    passthrough: string;
    popup: string;
    product: string;
    referring_domain: string;
  };
}

export interface PaddleSDK {
  Checkout: {
    open: (options: {
      product?: string | number;
      title?: string;
      message?: string;
      coupon?: string;
      email?: string;
      marketingConsent?: '0' | '1';
      country?: string;
      postcode?: string;
      allowQuantity?: boolean;
      quantity?: number;
      disableLogout?: boolean;
      locale?: string;
      passthrough?: string;
      customData?: object;
      referring_domain?: string;
      success?: string;
      successCallback?: string;
      closeCallback?: string;
      loadCallback?: string;
      upsell?: string | number;
      upsellTitle?: string;
      upsellText?: string;
      upsellAction?: string;
      upsellCoupon?: string;
      upsellPassthrough?: string;
      override?: string;
      displayModeTheme?: 'light' | 'dark';
      // Inline checkout
      method?: string;
      frameTarget?: string;
      frameInitialHeight?: number;
      frameStyle?: string;
    }) => void;
  };
  Environment: {
    set: (env: string) => void;
    get: () => string;
    detect: () => string;
  };
  Setup: (options: {
    vendor: number;
    eventCallback?: (data: PaddleEventCallback) => void;
  }) => void;
}

export declare global {
  interface Customer {
    total: number;
    total_tax: number;
    unit: string;
    unit_tax: string;
    currency: string;
  }

  type PaddleEvent =
    | 'Checkout.Loaded'
    | 'Checkout.Close'
    | 'Checkout.Complete'
    | 'Checkout.User.Subscribed'
    | 'Checkout.Quantity.Change'
    | 'Checkout.Login'
    | 'Checkout.Logout'
    | 'Checkout.PaymentMethodSelected'
    | 'Checkout.Coupon.Add'
    | 'Checkout.Coupon.Submit'
    | 'Checkout.Coupon.Cancel'
    | 'Checkout.Coupon.Applied'
    | 'Checkout.Coupon.Remove'
    | 'Checkout.Error'
    | 'Checkout.Location.Submit'
    | 'Checkout.Language.Change'
    | 'Checkout.Vat.Add'
    | 'Checkout.Vat.Cancel'
    | 'Checkout.Vat.Submit'
    | 'Checkout.Vat.Applied'
    | 'Checkout.Vat.Remove'
    | 'Checkout.WireTransfer.Complete'
    | 'Checkout.PaymentComplete'
    | 'Checkout.PaymentMethodChange'
    | 'Checkout.WireTransfer.PaymentMethodChange';

  interface Window {
    Paddle: PaddleSDK;
  }
}
