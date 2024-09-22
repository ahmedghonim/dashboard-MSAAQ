import { useContext } from "react";

import { GetServerSideProps } from "next";
import Image from "next/image";

import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import "swiper/css";
import { Controller, Navigation } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Layout } from "@/components";
import SwiperButtons from "@/components/shared/SwiperButtons";
import { FreshchatContext } from "@/contextes";
import i18nextConfig from "@/next-i18next.config";

import { BoltIcon } from "@heroicons/react/24/solid";

import { Button, Icon } from "@msaaqcom/abjad";

export const getServerSideProps: GetServerSideProps = async ({ locale }) => ({
  props: {
    ...(await serverSideTranslations(locale ?? i18nextConfig.i18n.defaultLocale, ["common"]))
  }
});

export default function NewPlatform() {
  const slider2 = [
    {
      title: "صفحة الدورات/المنتجات >> الصورة الأساسية",
      description: "النسبة المناسبة 16:9 في عرض الصور الخاصة بصفحات الدورات/المنتجات.",
      size: "نرشح W:1324 - H:744 (PX)",
      image: "/images/new-platforms/courses-cover.png"
    },
    {
      title: "الصور الشخصية",
      description: "النسبة المناسبة 1:1 في عرض الصور الشخصية للمدرب.",
      size: "نرشح W:144 - H:144 (PX)",
      image: "/images/new-platforms/profile-picture.png"
    },
    {
      title: "الكارد المصغرة >> الصورة الأساسية",
      description: "ننصح بالإلتزام بالنسبة 16:9 في عرض الصور الخاصة بصفحات المنتجات ",
      size: "نرشح W:618 - H:346 (PX)",
      image: "/images/new-platforms/card-images.png"
    },
    {
      title: "صفحة الحزم >> الصورة الأساسية",
      description: "الصورة الأساسية للحزمة ننصح أن تكون بالأبعاد التالية",
      size: "W:2880 - H:1016 (PX)",
      image: "/images/new-platforms/bundle-cover.png"
    }
  ];

  const items = [
    {
      title: "رتّب جلساتك الاستشارية",
      description:
        "أنشئ، جدول وأدر حجوزات الجلسات الاستشارية في مكان واحد.<br />*ستجد جلساتك القديمة في قسم المنتجات الرقمية.",
      steps: [
        "إدارة المحتوى >>> الجلسات الاستشارية",
        "أضف مواعيدك المتاحة، واختر شركاءك المستشارين لكل جلسة.",
        "أنت جاهز. أطلق الجلسة، عدّل بناء على احتياجات عملاءك بكل سهولة دائمًا."
      ]
    },
    {
      title: "استخدم كلماتك الخاصّة",
      description:
        "هل تستخدم كلمة مجتمع؟ أم ربما جَمعة؟ أو شلّة؟ الآن لديك المساحة لتستخدم كلماتك المفضّلة في وصف عناصر منصّتك. أطلق إبداعاتك!",
      steps: [
        "الإعدادات >>> إعدادات المنصة",
        "اذهب إلى النصوص المخصصة ",
        "قم بإعادة كتابة الأجزاء الجديدة. لا تغش من المنصات الأخرى... استخدم أفكارك أنت."
      ]
    },
    {
      title: "حدّث الأكواد المخصّصة",
      description:
        "في التحديث الجديد، تغيرت تقنيتنا إلى Tailwind CSS بدلاً من Bootstrap، مما يعني أن هناك بعض الأكواد التي يتوجب تحديثها، إن كنتَ تستخدمها سابقًا.",
      steps: ["الإعدادات >>> إعدادات المنصة", "اذهب إلى الأكواد المخصصة", "من تخصيص المنصة، قم بتحديث عناصر HTML"]
    },
    {
      title: "غيّر مقاسات الصور",
      description:
        "لأن التركيز على المهم هو ما يصنع الفرق عند قرار الشراء، جعلنا صور المنتجات مستطيلة. عميلك، سيرى فقط ما يهمّه فعلًا!",
      steps: [
        "توجّه إلى إدارة المحتوى",
        "قم بتغيير الصور البارزة لكل من الدورات والمنتجات",
        "لأبعاد الصور الجديدة، ستجده في القسم بالأسفل"
      ]
    }
  ];

  const gallery = [
    "واجهات مدروسة حسب استخدام عملائك",
    "إدارة أسهل وأكثر كفاءة",
    `لوحة تحكّم "تمنح عملاؤك تحكّمًا كاملًا"`,
    "تجربة تعليمية سهلة وفريدة",
    `الشراء من منصّتك بـ"عدد الضغطات"`,
    "منصّتك، كما تحب، متجاوبة مع كل الأجهزة"
  ];

  const { openChat } = useContext(FreshchatContext);

  return (
    <Layout
      title={"دورك الآن: احلم . اصنع . اوصل"}
      parentClassName="custom-gradient-bg"
    >
      <Layout.Container className="mt-3">
        <div className="mx-auto w-full max-w-[836px]">
          <div className="mb-16 flex flex-col items-center justify-center">
            <h2 className="mb-3 text-center text-lg font-bold text-gray-950 lg:text-2xl">
              اصنع التغييرات اللازمة لتصبح منصتك جاهزة 💪
            </h2>
            <span className="mb-4 text-center text-sm font-medium text-gray-800 lg:text-base">
              هنا قائمة مهام سريعة لكل ما تحتاج القيام به كي تصبح منصتك جاهزة...
            </span>
            <Button
              variant="info"
              rounded
              children={"تحتاج مساعدة؟ تواصل معنا"}
              onClick={() => openChat()}
            />
          </div>

          <div className="mb-16 rounded-[32px] bg-white !p-5 lg:!p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-secondary" />
              <div className="text-xl font-bold text-gray-950">قائمة مهامك</div>
            </div>
            <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {items.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col rounded-xl bg-gray-100 p-6"
                >
                  <div className="mb-3 text-xl font-semibold text-gray-900">{item.title}</div>
                  <div
                    className="mb-6 text-base font-normal text-gray-900"
                    dangerouslySetInnerHTML={{ __html: item.description }}
                  />
                  <div className="mb-3 font-semibold text-gray-900">مهمّتك:</div>
                  <ul className="flex flex-col gap-2">
                    {item.steps.map((step, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 rounded-lg bg-white p-4"
                      >
                        <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-gray-950 text-[9px] text-white">
                          {index + 1}
                        </span>
                        <span className="text-xs">{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            {/* Slider */}
            <div className="">
              <div className="mb-4 flex flex-col">
                <div className="mb-3 text-xl font-bold text-gray-950">جهّز المقاسات المناسبة للصور!</div>
                <div className="font-normal text-gray-900">
                  مع أنها تبدو مهمة مملة &quot;نوعًا ما&quot; إلا أنها ستضيف شكلًا لطيفًا، وتركيزًا مهمًا... والأهم أنك
                  ستشكرنا لاحقًا بعد تحديثها!
                </div>
              </div>
              <Swiper
                spaceBetween={30}
                navigation={true}
                modules={[Navigation, Controller]}
                breakpoints={{
                  640: {
                    slidesPerView: 1,
                    spaceBetween: 20
                  },
                  768: {
                    slidesPerView: 2.1,
                    spaceBetween: 16
                  },
                  1024: {
                    slidesPerView: 2.1,
                    spaceBetween: 16
                  }
                }}
                className="relative cursor-grab"
              >
                {slider2.map((item, index) => (
                  <SwiperSlide
                    key={index}
                    className="!h-auto"
                    onMouseDown={() => {}}
                  >
                    <div className="flex h-full flex-col overflow-hidden rounded-xl bg-gray-100 p-4">
                      <Image
                        className="mb-4 h-auto max-h-[428px] w-full max-w-[475px]"
                        src={item.image}
                        alt="library"
                        height={428}
                        width={475}
                      />
                      <h2 className="mb-3 text-base font-semibold text-info">{item.title}</h2>
                      <div className="mb-3 text-xl">{item.description}</div>
                      <span className="text-base font-normal text-gray-900">{item.size}</span>
                    </div>
                  </SwiperSlide>
                ))}
                <SwiperButtons />
              </Swiper>
            </div>
          </div>
          <div className="mb-16 rounded-[32px] bg-white !p-5 lg:!p-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="rounded-full bg-info p-4">
                <Icon className="text-white">
                  <BoltIcon />
                </Icon>
              </div>
              <div className="text-xl font-bold text-gray-950">
                ما الجديد؟ نسختنا القديمة كانت جيدة، لكن نسختنا الجديدة أفضل بكثير...
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {gallery.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col rounded-3xl bg-gray-100 p-4"
                >
                  <Image
                    className="mb-4 h-full w-full lg:max-w-[375px]"
                    src={`/images/new-platforms/grid/${index + 1}.png`}
                    alt="library"
                    height={428}
                    width={475}
                  />
                  <span className="text-center text-xl font-bold text-info-950">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout.Container>
    </Layout>
  );
}
