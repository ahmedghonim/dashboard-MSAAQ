import { type Slug } from "@/e2e/types";

const routes = {
  index: "/",
  affiliates: {
    index: "/affiliates",
    payouts: {
      index: "/affiliates/payouts",
      payoutId: (payoutId: Slug) => `/affiliates/payouts/${payoutId}`
    }
  },
  analytics: {
    customers: "/analytics/customers",
    earnings: "/analytics/earnings",
    products: "/analytics/products"
  },
  //   api: {
  //     apps: {
  //       slugCallback: (slug: Slug) => `/api/apps/${slug}/callback`
  //     },
  //     auth: {
  //       nextauth: "/api/auth/[...nextauth]"
  //     },
  //     v1: {
  //       integrations: {
  //         stcMarketplace: "/api/v1/integrations/stc-marketplace"
  //       }
  //     }
  //   },
  apps: {
    index: "/apps",
    slugCallback: (slug: Slug) => `/apps/${slug}/callback`,
    slugIndex: (slug: Slug) => `/apps/${slug}`
  },
  auth: {
    invitation: {
      token: (token: Slug) => `/auth/invitation/${token}`
    },
    login: "/login",
    passwordless: "/auth/passwordless",
    register: "/register",
    reset: {
      index: "/forgot-password",
      token: (token: Slug) => `/auth/reset/${token}`
    }
  },
  blog: {
    categories: "/blog/categories",
    index: "/blog",
    articleId: (articleId: Slug) => ({
      edit: `/blog/${articleId}/edit`,
      settings: `/blog/${articleId}/settings`
    })
  },
  bundles: {
    index: "/bundles",
    productId: (productId: Slug) => ({
      edit: `/bundles/${productId}/edit`,
      pricing: `/bundles/${productId}/pricing`,
      publishing: `/bundles/${productId}/publishing`,
      settings: `/bundles/${productId}/settings`
    })
  },
  "coaching-sessions": {
    index: "/coaching-sessions",
    productId: (productId: Slug) => ({
      edit: `/coaching-sessions/${productId}/edit`,
      pricing: `/coaching-sessions/${productId}/pricing`,
      publishing: `/coaching-sessions/${productId}/publishing`,
      reviews: `/coaching-sessions/${productId}/reviews`,
      settings: `/coaching-sessions/${productId}/settings`
    })
  },
  courses: {
    index: "/courses",
    courseId: (courseId: Slug) => ({
      chapters: {
        index: `/courses/${courseId}/chapters`,
        chapterId: (chapterId: Slug) => ({
          contents: {
            assignment: {
              create: `/courses/${courseId}/chapters/${chapterId}/contents/assignment/create`,
              edit: (contentId: Slug) =>
                `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/assignment/edit`
            },
            audio: {
              create: `/courses/${courseId}/chapters/${chapterId}/contents/audio/create`,
              edit: (contentId: Slug) => `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/audio/edit`
            },
            meeting: {
              create: `/courses/${courseId}/chapters/${chapterId}/contents/meeting/create`,
              edit: (contentId: Slug) => `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/meeting/edit`
            },
            pdf: {
              create: `/courses/${courseId}/chapters/${chapterId}/contents/pdf/create`,
              edit: (contentId: Slug) => `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/pdf/edit`
            },
            quiz: {
              create: `/courses/${courseId}/chapters/${chapterId}/contents/quiz/create`,
              edit: (contentId: Slug) => `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/quiz/edit`,
              builder: (contentId: Slug) =>
                `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/quiz/builder`
            },
            text: {
              create: `/courses/${courseId}/chapters/${chapterId}/contents/text/create`,
              edit: (contentId: Slug) => `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/text/edit`
            },
            video: {
              create: `/courses/${courseId}/chapters/${chapterId}/contents/video/create`,
              edit: (contentId: Slug) => `/courses/${courseId}/chapters/${chapterId}/contents/${contentId}/video/edit`
            }
          }
        })
      },
      dripContent: {
        index: `/courses/${courseId}/drip-content`
      },
      enrollments: {
        index: `/courses/${courseId}/enrollments`
      },
      pricing: {
        index: `/courses/${courseId}/pricing`
      },
      publishing: {
        index: `/courses/${courseId}/publishing`
      },
      reviews: {
        index: `/courses/${courseId}/reviews`
      },
      settings: {
        index: `/courses/${courseId}/settings`
      },
      "students-management": {
        index: `/courses/${courseId}/students-management`
      }
    })
  },
  "join-beta": "/join-beta",
  marketing: {
    affiliates: {
      payouts: "/marketing/affiliates/payouts",
      settings: "/marketing/affiliates/settings"
    },
    coupons: {
      create: "/marketing/coupons/create",
      index: "/marketing/coupons",
      couponId: (couponId: Slug) => ({
        edit: `/marketing/coupons/${couponId}/edit`,
        stats: `/marketing/coupons/${couponId}/stats`
      })
    }
  },
  msaaqPay: {
    index: "/msaaq-pay",
    payouts: {
      index: "/msaaq-pay/payouts",
      payoutId: (payoutId: Slug) => `/msaaq-pay/payouts/${payoutId}`
    },
    settings: "/msaaq-pay/settings",
    transactions: {
      index: "/msaaq-pay/transactions",
      transactionId: (transactionId: Slug) => `/msaaq-pay/transactions/${transactionId}`
    }
  },
  orders: {
    "bank-transfers": {
      index: "/orders/bank-transfers",
      bankTransferId: {
        index: (bankTransferId: Slug) => `/orders/bank-transfers/${bankTransferId}`
      }
    },
    index: "/orders",
    orderId: {
      index: (orderId: Slug) => `/orders/${orderId}`
    }
  },
  products: {
    index: "/products",
    productId: (productId: Slug) => ({
      downloads: `/products/${productId}/downloads`,
      edit: `/products/${productId}/edit`,
      index: `/products/${productId}`,
      pricing: `/products/${productId}/pricing`,
      publishing: `/products/${productId}/publishing`,
      reviews: `/products/${productId}/reviews`,
      settings: `/products/${productId}/settings`
    })
  },
  profile: "/profile",
  quizzes: {
    bank: {
      index: "/quizzes/bank",
      quizId: (quizId: Slug) => ({
        index: `/quizzes/bank/${quizId}`,
        questions: {
          create: `/quizzes/bank/${quizId}/questions/create`,
          index: `/quizzes/bank/${quizId}/questions`,
          questionId: (questionId: Slug) => ({
            edit: `/quizzes/bank/${quizId}/questions/${questionId}/edit`
          })
        }
      })
    }
  },
  settings: {
    billing: {
      invoices: "/settings/billing/invoices",
      paymentMethods: "/settings/billing/payment-methods",
      smsBundles: "/settings/billing/sms-bundles",
      subscription: {
        index: "/settings/billing/subscription",
        plans: "/settings/billing/subscription/plans"
      }
    },
    codeSnippets: "/settings/code-snippets",
    domain: "/settings/domain",
    forms: "/settings/forms",
    index: "/settings",
    paymentGateways: "/settings/payment-gateways",
    team: {
      index: "/settings/team"
    },
    translations: "/settings/translations",
    verify: {
      index: "/settings/verify",
      nelc: "/settings/verify/nelc",
      status: "/settings/verify/status"
    }
  },
  students: {
    assignments: {
      index: "/students/assignments",
      assignmentMemberId: (assignmentMemberId: Slug) => `/students/assignments/${assignmentMemberId}`
    },
    certificates: {
      create: "/students/certificates/create",
      index: "/students/certificates",
      certificateTemplateId: (certificateTemplateId: Slug) => `/students/certificates/${certificateTemplateId}/edit`
    },
    comments: "/students/comments",
    index: "/students",
    notifications: {
      academy: "/students/notifications/academy",
      index: "/students/notifications"
    },
    quizzes: {
      index: "/students/quizzes",
      quizId: {
        results: (quizId: Slug) => `/students/quizzes/${quizId}/results`
      }
    },
    memberId: (memberId: Slug) => ({
      courses: `/students/${memberId}/courses`,
      index: `/students/${memberId}`,
      orders: `/students/${memberId}/orders`,
      products: `/students/${memberId}/products`
    })
  },
  taxonomies: {
    categories: "/taxonomies/categories",
    levels: "/taxonomies/levels"
  },
  "video-library": {
    index: "/video-library"
  }
};

export default routes;
