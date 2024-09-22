import { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useRouter } from "next/router";

import { groupBy } from "lodash";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import { Card, Layout } from "@/components";
import Ksa93Banner from "@/components/Ksa93Banner";
import { Plans as PlansList } from "@/components/shared/plans/Plans";
import i18nextConfig from "@/next-i18next.config";
import { useFetchPlansQuery } from "@/store/slices/api/billing/plansSlice";
import { Plan, Plans } from "@/types";
import { classNames } from "@/utils";

import { CheckIcon } from "@heroicons/react/24/outline";
import { ArrowRightIcon } from "@heroicons/react/24/solid";

import { Button, Icon, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common", "courses"]))
  }
});

type Group = {
  [key: string]: string[];
};

interface Addons extends Omit<Plan, "addons"> {
  addons: any;
}

export default function General() {
  const { t } = useTranslation();
  const router = useRouter();

  const { data: plans } = useFetchPlansQuery({
    locale: router.locale
  });
  const [groups, setGroups] = useState<Group>({});
  const [formattedPlans, setFormattedPlans] = useState<Addons[]>([]);

  useEffect(() => {
    if (!plans) return;

    const addons = plans.map((plan) => ({
      ...plan,
      addons: groupBy(plan.addons, "group")
    }));

    setFormattedPlans(addons);

    // get only unique groups
    let groups: any = {};
    addons.forEach((plan) => {
      Object.keys(plan.addons).forEach((group) => {
        groups = {
          ...groups,
          [group]: plan.addons[group].map((addon: any) => addon.title)
        };
      });
    });

    setGroups(groups);
  }, [plans]);

  const getPlanColor = (plan: Plan) => {
    switch (plan.slug) {
      case Plans.GROWTH:
        return "text-orange";
      case Plans.PRO:
        return "text-purple";
    }
  };

  return (
    <Layout
      title={t("sidebar.settings.billing.title")}
      hasHeader={false}
    >
      <Layout.Container className="flex flex-col gap-4">
        <div>
          <Button
            variant="default"
            icon={
              <Icon
                children={<ArrowRightIcon />}
                size="sm"
              />
            }
            onClick={() => router.back()}
            children={t("back")}
          />
        </div>

        <Ksa93Banner />

        {plans && (
          <PlansList
            plans={plans}
            title={t("billing.plans.plans_and_pricing")}
          />
        )}

        <Typography.Paragraph
          children={t("billing.plans.compare_plans")}
          weight="medium"
        />

        <Card className="pb-2">
          {Object.keys(groups)?.map((group, i) => (
            <div key={i}>
              <div className="w-full overflow-x-auto">
                <table className="w-full">
                  <colgroup>
                    <col
                      span={1}
                      style={{ minWidth: 250, width: "40%" }}
                    />
                    <col
                      span={1}
                      style={{ minWidth: 150, width: "20%" }}
                    />
                    <col
                      span={1}
                      style={{ minWidth: 150, width: "20%" }}
                    />
                    <col
                      span={1}
                      style={{ minWidth: 150, width: "20%" }}
                    />
                  </colgroup>

                  <thead>
                    <tr>
                      <th
                        className="px-6 py-4 text-start"
                        children={
                          <Typography.Paragraph
                            children={t(`billing.plans.groups.${group}`)}
                            size="sm"
                            weight="bold"
                          />
                        }
                      />

                      {plans?.map((plan, x) => (
                        <th
                          key={x}
                          className={classNames(getPlanColor(plan), "px-6 py-4 text-start")}
                          children={
                            <Typography.Paragraph
                              children={plan.title}
                              size="sm"
                            />
                          }
                        />
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {groups[group].map((title, i) => (
                      <tr key={i}>
                        <th
                          className="px-6 py-2 text-start"
                          children={
                            <Typography.Paragraph
                              children={title}
                              size="sm"
                            />
                          }
                        />

                        {formattedPlans?.map((plan, x) => {
                          const addon = plan.addons[group].find((item: any) => item.title === title);
                          return (
                            <th
                              key={x}
                              className="px-6 py-2 text-start"
                            >
                              <Typography.Paragraph
                                size="sm"
                                children={
                                  addon?.is_available ? (
                                    addon?.comparison_label || (
                                      <Icon
                                        children={<CheckIcon />}
                                        size="sm"
                                      />
                                    )
                                  ) : (
                                    <span
                                      children="—"
                                      className="text-gray-600"
                                    />
                                  )
                                }
                              />
                            </th>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {i !== Object.keys(groups).length - 1 && <hr className="mx-6 mb-2 mt-4 border-gray" />}
            </div>
          ))}
        </Card>
      </Layout.Container>
    </Layout>
  );
}
