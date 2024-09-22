import { forwardRef, useEffect, useState } from "react";

import { i18n, useTranslation } from "next-i18next";
import Phone, { CountryData } from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { Countries } from "@/utils/countriesList";

const PhoneInput = forwardRef(({ onChange, value, country = "sa", name, ...props }: { [key: string]: any }, ref) => {
  const [phone, setPhone] = useState<string>("");
  const { t } = useTranslation();

  const lang = Object.fromEntries(
    Countries.map(($country) => [
      $country.iso_3166_1_alpha2.toLocaleLowerCase(),
      i18n?.language == "ar" ? $country.ar_name : $country.name
    ])
  );

  useEffect(() => {
    if (!phone) {
      if (typeof value === "string") {
        setPhone(value);
      } else if (typeof value === "object") {
        setPhone(`${value?.dialCode}${value?.number}`);
      }
    }
  }, [value]);
  return (
    <div className="ms-form-control overflow-visible">
      <Phone
        searchPlaceholder={t("search_country_name")}
        country={country.toLowerCase()}
        localization={lang}
        disableSearchIcon={true}
        jumpCursorToEnd={true}
        containerStyle={{
          direction: "ltr"
        }}
        searchStyle={{ margin: 0, border: 0, borderRadius: "0" }}
        buttonClass={"!bg-transparent !border-0 rounded-md"}
        dropdownClass={"!shadow-md  border border-gray-400 !rounded-md !px-3"}
        inputClass={"!h-full outline-0 bg-transparent !border-0 !w-full"}
        inputProps={{
          name
        }}
        enableSearch
        countryCodeEditable={true}
        onChange={(phone, country) => {
          setPhone(phone);
          const number = phone.slice((country as CountryData).dialCode?.length);
          if (!number) {
            onChange?.(null);
            return;
          }
          onChange?.({
            number: phone.slice((country as CountryData).dialCode?.length),
            dialCode: (country as CountryData).dialCode
          });
        }}
        value={phone}
        {...props}
      />
    </div>
  );
});

export default PhoneInput;
