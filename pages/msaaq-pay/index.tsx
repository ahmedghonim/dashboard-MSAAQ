import React, { useCallback, useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import Link from "next/link";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import PayoutsCols from "@/columns/payouts";
import TransactionsCols from "@/columns/transactions";
import { Card, Datatable, EmptyStateTable, Layout, LineChart, RangeDateInput } from "@/components";
import MsaaqpayWasDisabledAlert from "@/components/Alerts/MsaaqpayWasDisabledAlert";
import VerifyAcademyToEnableMsaaqPayAlert from "@/components/Alerts/VerifyAcademyToEnableMsaaqPayAlert";
import { MsaaqPayIcon } from "@/components/Icons/solid";
import ActivateMsaaqPayCard from "@/components/cards/ActivateMsaaqPayCard";
import { useAppSelector, useFormatPrice } from "@/hooks";
import dayjs from "@/lib/dayjs";
import i18nextConfig from "@/next-i18next.config";
import {
  useFetchMsaaqPaySalesChartQuery,
  useFetchMsaaqPayStatsQuery
} from "@/store/slices/api/msaaq-pay/msaaqpaySlice";
import { useFetchPayoutsQuery } from "@/store/slices/api/msaaq-pay/payoutsSlice";
import { useFetchTransactionsQuery } from "@/store/slices/api/msaaq-pay/transactionsSlice";
import { AppSliceStateType } from "@/store/slices/app-slice";
import { AuthSliceStateType } from "@/store/slices/auth-slice";
import { DateRangeType, TransactionType } from "@/types";

import { ExclamationCircleIcon } from "@heroicons/react/24/solid";

import { Button, Grid, Icon, Title, Tooltip, Typography } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

interface IChart {
  aggregate: number;
  date: string;
}

interface DataObject {
  date: string;

  [key: string]: any;
}

interface IChartData {
  data: DataObject[];
  hasPositiveAggregate: boolean;
}

const LoadingCard = () => {
  return (
    <Card className="mx-auto mb-6">
      <Card.Body className=" animate-pulse">
        <div className="mb-5 flex space-x-4">
          <div className="flex w-full items-start py-1">
            <div className="flex flex-col  gap-3">
              <div className="flex gap-3">
                <div className="h-8 w-20 rounded bg-gray"></div>
                <div className="flex flex-col gap-2">
                  <div className="h-2 w-10 rounded bg-gray"></div>
                  <div className="h-2 w-20 rounded bg-gray"></div>
                </div>
              </div>
              <div className="mt-4 h-2 w-52 rounded bg-gray"></div>
              <div className="h-2 w-48 rounded bg-gray"></div>
              <div className="h-2 w-56 rounded bg-gray"></div>
              <div className="h-2 w-52 rounded bg-gray"></div>
              <div className="h-2 w-56 rounded bg-gray"></div>
              <div className="mt-4 flex gap-2">
                <div className="h-8 w-16 rounded bg-gray"></div>
                <div className="h-8 w-16 rounded bg-gray"></div>
                <div className="h-8 w-16 rounded bg-gray"></div>
                <div className="h-8 w-16 rounded bg-gray"></div>
              </div>
            </div>
            <div className="mr-auto h-36 w-60 rounded bg-gray"></div>
          </div>
        </div>
        <hr />
        <div className=" mt-5 h-10 w-24 rounded bg-gray"></div>
      </Card.Body>
    </Card>
  );
};

const defaultRangeValue = {
  from: dayjs().subtract(6, "day").toDate(),
  formatted_from: dayjs().subtract(6, "day").format("YYYY-MM-DD"),
  to: dayjs().toDate(),
  formatted_to: dayjs().format("YYYY-MM-DD")
};

export default function Index() {
  const { t } = useTranslation();
  const [isTransactionsTableEmpty, setIsTransactionsTableEmpty] = useState<boolean>(false);
  const [isPayoutsTableEmpty, setIsPayoutsTableEmpty] = useState<boolean>(false);
  const [options, setOptions] = useState<IChartData>({} as IChartData);

  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);
  const { current_academy } = useAppSelector<AuthSliceStateType>((state) => state.auth);

  const { msaaqpay } = useAppSelector<AppSliceStateType>((state) => state.app);

  const [range, setRange] = useState<DateRangeType>(defaultRangeValue);

  const {
    data: stats = {} as {
      total_balance: number;
      pending_balance: number;
      available_balance: number;
      currency: string;
    }
  } = useFetchMsaaqPayStatsQuery();

  const {
    data: chart,
    isLoading,
    isFetching
  } = useFetchMsaaqPaySalesChartQuery({
    from_date: range?.formatted_from,
    to_date: range?.formatted_to
  });

  const { formatPriceWithoutCurrency, currentCurrency } = useFormatPrice(stats.currency);

  const makeDataObject = useCallback(
    (data: IChart): DataObject => ({
      date: data.date,
      [currentCurrency]: data.aggregate
    }),
    []
  );
  const makeDataArray = useCallback(
    (data: IChart[]): IChartData => {
      return {
        data: data.map(makeDataObject),
        hasPositiveAggregate: data.some((item) => item.aggregate > 0)
      };
    },
    [makeDataObject]
  );

  useEffect(() => {
    if (!isFetching && chart) {
      setOptions(makeDataArray(chart));
    }
  }, [isFetching, range, chart]);

  useEffect(() => {
    if (msaaqpay && current_academy) {
      setIsDataLoading(false);
    }
  }, [current_academy, msaaqpay]);

  return (
    <Layout title={t("msaaq_pay.title")}>
      <Layout.Container>
        {isDataLoading ? (
          <LoadingCard />
        ) : (
          <>
            {!current_academy.is_verified && <VerifyAcademyToEnableMsaaqPayAlert />}
            {msaaqpay && !msaaqpay.installed && msaaqpay.was_prev_installed && current_academy.is_verified && (
              <MsaaqpayWasDisabledAlert />
            )}
            {msaaqpay && !msaaqpay.installed && <ActivateMsaaqPayCard />}
            {msaaqpay && msaaqpay.installed && (
              <>
                <RangeDateInput
                  defaultValue={defaultRangeValue}
                  onChange={setRange}
                />
                <Card>
                  <Card.Body>
                    <Grid
                      columns={{
                        lg: 12
                      }}
                    >
                      <Grid.Cell
                        columnSpan={{
                          lg: 8
                        }}
                      >
                        <div className="mb-4 flex flex-row items-center gap-x-4">
                          <Typography.Paragraph
                            weight="medium"
                            as="h3"
                          >
                            المبيعات
                          </Typography.Paragraph>
                        </div>
                        {!isLoading && (
                          <LineChart
                            data={options.data}
                            dataKey="date"
                            minValue={options.hasPositiveAggregate ? undefined : 1000}
                            maxValue={options.hasPositiveAggregate ? undefined : 2000}
                            valueFormatter={(value) => {
                              return formatPriceWithoutCurrency(value);
                            }}
                            categories={[currentCurrency]}
                            showLegend={false}
                          />
                        )}
                      </Grid.Cell>
                      <Grid.Cell
                        columnSpan={{
                          lg: 4
                        }}
                      >
                        <Card>
                          <Card.Header>
                            <Typography.Paragraph
                              as="h3"
                              weight="medium"
                              children={t("msaaq_pay.stats.title")}
                            />
                          </Card.Header>
                          <Card.Body className="space-y-4 bg-gray-100">
                            <Card>
                              <Card.Body>
                                <Title
                                  reverse
                                  title={
                                    <>
                                      <span className="flex gap-x-1">
                                        <Typography.Paragraph
                                          as="span"
                                          weight="bold"
                                          children={formatPriceWithoutCurrency(stats.total_balance)}
                                        />
                                        <Typography.Paragraph
                                          as="span"
                                          weight="normal"
                                          size="sm"
                                          className="text-gray-800"
                                          children={currentCurrency}
                                        />
                                      </span>
                                    </>
                                  }
                                  subtitle={
                                    <>
                                      <span className="flex gap-2">
                                        <Typography.Paragraph
                                          as="span"
                                          size="sm"
                                          weight="normal"
                                          className="text-gray-800"
                                          children={t("msaaq_pay.stats.available_balance")}
                                        />
                                        <Tooltip>
                                          <Tooltip.Trigger>
                                            <Icon>
                                              <ExclamationCircleIcon className="text-gray-600" />
                                            </Icon>
                                          </Tooltip.Trigger>
                                          <Tooltip.Content>
                                            {t("msaaq_pay.stats.available_balance_tooltip")}
                                          </Tooltip.Content>
                                        </Tooltip>
                                      </span>
                                    </>
                                  }
                                />
                              </Card.Body>
                            </Card>
                            <Card>
                              <Card.Body>
                                <Title
                                  reverse
                                  title={
                                    <>
                                      <span className="flex gap-x-1">
                                        <Typography.Paragraph
                                          as="span"
                                          weight="bold"
                                          children={formatPriceWithoutCurrency(stats.pending_balance)}
                                        />
                                        <Typography.Paragraph
                                          as="span"
                                          weight="normal"
                                          size="sm"
                                          className="text-gray-800"
                                          children={currentCurrency}
                                        />
                                      </span>
                                    </>
                                  }
                                  subtitle={
                                    <>
                                      <span className="flex gap-2">
                                        <Typography.Paragraph
                                          as="span"
                                          size="sm"
                                          weight="normal"
                                          className="text-gray-800"
                                          children={t("msaaq_pay.stats.pending_balance")}
                                        />
                                        <Tooltip>
                                          <Tooltip.Trigger>
                                            <Icon>
                                              <ExclamationCircleIcon className="text-gray-600" />
                                            </Icon>
                                          </Tooltip.Trigger>
                                          <Tooltip.Content>
                                            {t("msaaq_pay.stats.pending_balance_tooltip")}
                                          </Tooltip.Content>
                                        </Tooltip>
                                      </span>
                                    </>
                                  }
                                />
                              </Card.Body>
                            </Card>
                            <Card>
                              <Card.Body>
                                <Title
                                  reverse
                                  title={
                                    <>
                                      <span className="flex gap-x-1">
                                        <Typography.Paragraph
                                          as="span"
                                          weight="bold"
                                          children={formatPriceWithoutCurrency(stats.available_balance)}
                                        />
                                        <Typography.Paragraph
                                          as="span"
                                          weight="normal"
                                          size="sm"
                                          className="text-gray-800"
                                          children={currentCurrency}
                                        />
                                      </span>
                                    </>
                                  }
                                  subtitle={
                                    <>
                                      <span className="flex gap-2">
                                        <Typography.Paragraph
                                          as="span"
                                          size="sm"
                                          weight="normal"
                                          className="text-gray-800"
                                          children={t("msaaq_pay.stats.pending_payouts")}
                                        />
                                        <Tooltip>
                                          <Tooltip.Trigger>
                                            <Icon>
                                              <ExclamationCircleIcon className="text-gray-600" />
                                            </Icon>
                                          </Tooltip.Trigger>
                                          <Tooltip.Content>
                                            {t("msaaq_pay.stats.pending_payouts_tooltip")}
                                          </Tooltip.Content>
                                        </Tooltip>
                                      </span>
                                    </>
                                  }
                                />
                              </Card.Body>
                            </Card>
                          </Card.Body>
                        </Card>
                      </Grid.Cell>
                    </Grid>
                  </Card.Body>
                </Card>
                <Grid
                  className="mt-8"
                  columns={{
                    lg: 12
                  }}
                >
                  <Grid.Cell
                    columnSpan={{
                      lg: 6
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="mb-2 flex flex-row items-center justify-between">
                        <Typography.Paragraph
                          as="span"
                          weight="medium"
                          size="md"
                        >
                          {t("msaaq_pay.latest_transactions")}
                        </Typography.Paragraph>
                        {isTransactionsTableEmpty && (
                          <Button
                            as={Link}
                            href={`/msaaq-pay/transactions`}
                            variant="link"
                            size="sm"
                            children={t("msaaq_pay.view_all_transactions")}
                          />
                        )}
                      </div>
                      <Datatable
                        columns={{
                          columns: TransactionsCols,
                          props: {
                            columns: ["payer", "amount", "payment_method"]
                          }
                        }}
                        pageSize={4}
                        fetcher={useFetchTransactionsQuery}
                        params={{
                          filters: {
                            type: TransactionType.DEPOSIT
                          },
                          only_with: ["payer"],
                          per_page: 4
                        }}
                        setIsTableEmpty={setIsTransactionsTableEmpty}
                        selectable={false}
                        hasPagination={false}
                        hasFilter={false}
                        hasSearch={false}
                        emptyState={
                          <EmptyStateTable
                            title={t("msaaq_pay.transactions.empty_state.title")}
                            content={t("msaaq_pay.transactions.empty_state.description")}
                            icon={<MsaaqPayIcon />}
                          />
                        }
                      />
                    </div>
                  </Grid.Cell>
                  <Grid.Cell
                    columnSpan={{
                      lg: 6
                    }}
                  >
                    <div className="flex flex-col">
                      <div className="mb-2 flex flex-row items-center justify-between">
                        <Typography.Paragraph
                          as="span"
                          weight="medium"
                          size="md"
                        >
                          {t("msaaq_pay.latest_payouts")}
                        </Typography.Paragraph>
                        {isPayoutsTableEmpty && (
                          <Button
                            as={Link}
                            href={`/msaaq-pay/payouts`}
                            variant="link"
                            size="sm"
                            children={t("msaaq_pay.view_all_payouts")}
                          />
                        )}
                      </div>
                      <Datatable
                        columns={{
                          columns: PayoutsCols,
                          props: {
                            columns: ["bank", "amount", "status"]
                          }
                        }}
                        params={{
                          per_page: 4
                        }}
                        setIsTableEmpty={setIsPayoutsTableEmpty}
                        selectable={false}
                        hasFilter={false}
                        hasPagination={false}
                        fetcher={useFetchPayoutsQuery}
                        emptyState={
                          <EmptyStateTable
                            title={t("msaaq_pay.payouts.empty_state.title")}
                            content={t("msaaq_pay.payouts.empty_state.description")}
                            icon={<MsaaqPayIcon />}
                          />
                        }
                      />
                    </div>
                  </Grid.Cell>
                </Grid>
              </>
            )}
          </>
        )}
      </Layout.Container>
    </Layout>
  );
}
