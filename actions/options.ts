import { AxiosResponse } from "axios";
import camelCase from "camelcase";
import { isEmpty } from "lodash";

import axios from "@/lib/axios";
import {
  APIResponse,
  AnyObject,
  CertificateTemplate,
  Country,
  Course,
  CourseStatus,
  Currency,
  Language,
  Page,
  ProductStatus,
  Quiz,
  Segment,
  Taxonomy,
  TaxonomyType,
  User
} from "@/types";
import { CacheHandler } from "@/utils";

type inputValue = string;
type callback = (options: Array<object>) => void;

const cache = new CacheHandler();

const loadOptions = async (endpoint: string, inputValue: inputValue, params: AnyObject = {}) => {
  const cacheKey = `${endpoint}(${JSON.stringify({ ...params, search: inputValue?.trim() || null })})`;

  const cachedValue = cache.getCache(cacheKey);
  if (cachedValue) {
    return Promise.resolve(cachedValue);
  }

  delete params["cache_key"];

  return await axios
    .get(endpoint, {
      params: {
        ...params,
        search: inputValue?.trim() || null
      }
    })
    .then((res) => {
      cache.setCache(cacheKey, res, 60 * 3);

      return res;
    });
};

export const loadCertificatesTemplates = async (
  inputValue: inputValue,
  callback: callback,
  filterOptions?: (data: Array<CertificateTemplate>) => { label: string; value: number; [key: string]: any }[],
  params: object = {}
) => {
  await loadOptions("/certificate_templates", inputValue, params).then(
    (res: AxiosResponse<APIResponse<CertificateTemplate>>) => {
      callback(
        filterOptions
          ? filterOptions(res.data.data)
          : res.data.data.map((item) => ({
              label: item.name,
              value: item.id,
              ...item
            }))
      );
    }
  );
};
//TODO: remove this function after adding the new api
export const loadCountries = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/countries", inputValue, params).then((res: AxiosResponse<APIResponse<Country>>) => {
    callback(
      res.data.data.map((item) => ({
        label: item.ar_name,
        value: {
          iso2: item.iso_3166_1_alpha2,
          flag: item.emoji
        }
      }))
    );
  });
};
//TODO: remove this function after adding the new api
export const loadCurrencies = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/currencies", inputValue, params).then((res: AxiosResponse<APIResponse<Currency>>) => {
    callback(
      res.data.data.map((item) => ({
        label: item.name,
        value: item.code,
        ...item
      }))
    );
  });
};

export const loadInstructors = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/users/instructors", inputValue, params).then((res: AxiosResponse<APIResponse<User>>) => {
    callback(
      res.data.data.map((item) => ({
        label: item.name,
        value: item.id
      }))
    );
  });
};

export const loadCoachingInstructors = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/users/instructors", inputValue, params).then((res: AxiosResponse<APIResponse<User>>) => {
    const data = res.data.data.map((item) => ({
      id: item.id,
      label: item.name,
      has_google_calendar: item.has_google_calendar,
      value: item.id,
      isDisabled: !item.has_google_calendar,
      avatar: item.avatar
    }));

    data.sort((a, b) => {
      if (a.isDisabled && !b.isDisabled) {
        return 1;
      }
      if (!a.isDisabled && b.isDisabled) {
        return -1;
      }
      return 0;
    });

    callback(data);
  });
};

export const loadUsers = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/users", inputValue, params).then((res: AxiosResponse<APIResponse<User>>) => {
    callback(
      res.data.data.map((item) => ({
        label: item.name,
        value: item.id
      }))
    );
  });
};

interface Item {
  id: number;
  status: ProductStatus | CourseStatus;
  title: string;
  name: string;
}

interface DataObject {
  data: { [key: string]: Item[] | undefined };
}

interface MappedItem {
  type: string;
  status: ProductStatus | CourseStatus;
  id: number;
  label: string;
  value: string;
}

export const searchInProductsOrCourses = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/search", inputValue, {
    ...params,
    q: inputValue?.trim(),
    in: ["courses", "products"],
    status: [CourseStatus.PUBLISHED, CourseStatus.UNLISTED, CourseStatus.SCHEDULED]
  }).then((res: AxiosResponse<DataObject>) => {
    callback(
      Object.entries(res.data.data).reduce((acc: MappedItem[], [key, value]) => {
        if (Array.isArray(value)) {
          const itemType = key === "courses" ? "Course" : "Product";
          acc.push(
            ...value.map((item) => ({
              type: itemType,
              id: item.id,
              status: item.status,
              label: item.title,
              value: `${itemType}-${item.id}`
            }))
          );
        }
        return acc;
      }, [])
    );
  });
};
export const searchInSegments = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/search", inputValue, {
    ...params,
    q: inputValue?.trim(),
    in: ["segments"]
  }).then((res: AxiosResponse<DataObject>) => {
    callback(
      Object.entries(res.data.data).reduce(
        (
          acc: {
            id: number;
            label: string;
            value: string | number;
          }[],
          [key, value]
        ) => {
          if (Array.isArray(value)) {
            acc.push(
              ...value.map((item) => ({
                id: item.id,
                label: item.name,
                value: item.id
              }))
            );
          }
          return acc;
        },
        []
      )
    );
  });
};
export const search = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  if (!inputValue) return callback([]);

  await loadOptions("/search", inputValue, {
    ...params,
    q: inputValue?.trim()
    // in: ["courses", "products", "articles", "orders", "members"]
  }).then(({ data }: AxiosResponse<DataObject>) => {
    callback(
      Object.keys(data.data).map((key) => ({
        label: key,
        options: data.data[key]?.map((item) => ({
          ...item,
          type: key,
          label: item.title,
          value: item.id
        }))
      }))
    );
  });
};
export const loadMembers = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/members", inputValue, params).then((res: AxiosResponse<APIResponse<User>>) => {
    callback(
      res.data.data.map((item) => ({
        label: item.name,
        value: item.id
      }))
    );
  });
};

export const loadSegments = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/members/segments", inputValue, params).then((res: AxiosResponse<APIResponse<Segment>>) => {
    callback(
      res.data.data.map((item) => ({
        label: item.name,
        value: item.id,
        icon: `${camelCase(item.icon, {
          pascalCase: true
        })}Icon`,
        members_count: item.members_count
      }))
    );
  });
};
export const loadCourses = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/courses", inputValue, params).then((res: AxiosResponse<APIResponse<Course>>) => {
    callback(
      res.data.data.map((item) => ({
        label: item.title,
        value: item.id
      }))
    );
  });
};
export const loadPages = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/pages", inputValue, params).then((res: AxiosResponse<APIResponse<Page>>) => {
    const filteredPages = res.data.data.filter((item) => item.is_home !== true);
    callback(
      filteredPages.map((item) => ({
        label: item.title,
        value: item.id
      }))
    );
  });
};
export const loadSupportedLanguages = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadOptions("/settings/supported-locales", inputValue, params).then(
    (res: AxiosResponse<APIResponse<Language>>) => {
      callback(
        res.data.data.map((item) => ({
          label: item.native,
          value: item
        }))
      );
    }
  );
};
export const loadTaxonomies = async (
  inputValue: inputValue,
  callback: callback,
  params: object = {},
  filterOptions?: (data: Array<Taxonomy>) => { label: string; value: number; [key: string]: any }[]
) => {
  await loadOptions("/taxonomies", inputValue, params).then((res: AxiosResponse<APIResponse<Taxonomy>>) => {
    callback(
      filterOptions
        ? filterOptions(res.data.data)
        : res.data.data.map((item) => ({
            label: item.name,
            value: item.id
          }))
    );
  });
};

export const loadQuizzes = async (inputValue: inputValue, callback: callback, params: object = {}, exclude?: any) => {
  await loadOptions("/quizzes", inputValue, params).then((res: AxiosResponse<APIResponse<Quiz>>) => {
    const data = res.data.data.map((item) => ({
      label: item.title,
      value: item.id,
      isDisabled: !isEmpty(exclude?.find((bank: any) => bank.id === item.id)) ? true : false,
      ...item
    }));

    data.sort((a, b) => {
      if (a.isDisabled && !b.isDisabled) {
        return 1;
      }
      if (!a.isDisabled && b.isDisabled) {
        return -1;
      }
      return 0;
    });

    callback(data);
  });
};

export const loadCategories = async (
  inputValue: inputValue,
  callback: callback,
  type?: TaxonomyType,
  params: object = {},
  filterOptions?: (data: Array<Taxonomy>) => { label: string; value: number; [key: string]: any }[]
) => {
  await loadTaxonomies(
    inputValue,
    callback,
    {
      ...params,
      ...(type && { filters: { type } })
    },
    filterOptions
  );
};

export const loadDifficulties = async (
  inputValue: inputValue,
  callback: callback,
  params: object = {},
  filterOptions?: (data: Array<Taxonomy>) => { label: string; value: number; [key: string]: any }[]
) => {
  await loadTaxonomies(
    inputValue,
    callback,
    {
      ...params,
      filters: {
        type: TaxonomyType.COURSE_DIFFICULTY
      }
    },
    filterOptions
  );
};

export const loadArticleTaxonomies = async (inputValue: inputValue, callback: callback, params: object = {}) => {
  await loadTaxonomies(inputValue, callback, {
    ...params,
    filters: {
      type: TaxonomyType.POST_CATEGORY
    }
  });
};
