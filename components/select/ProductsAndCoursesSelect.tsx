import React, { forwardRef } from "react";

import { searchInProductsOrCourses } from "@/actions/options";
import { Select } from "@/components/select";
import { SelectProps } from "@/components/select/Select";
import { Course, Product } from "@/types";

interface ProductsAndCoursesSelectProps extends SelectProps {
  filterProducts?: (product: Product) => boolean;
  filterCourses?: (course: Course) => boolean;
  isMulti?: boolean;
}

const ProductsAndCoursesSelect = forwardRef<any, ProductsAndCoursesSelectProps>(
  ({ filterProducts, filterCourses, isMulti = true, ...props }, ref) => {
    return (
      <Select
        ref={ref}
        isMulti={isMulti}
        filterOption={(option) => {
          if (option.data.type === "Product" && filterProducts) {
            return filterProducts(option.data);
          } else if (option.data.type === "Course" && filterCourses) {
            return filterCourses(option.data);
          }
          return true;
        }}
        loadOptions={searchInProductsOrCourses}
        isOptionDisabled={(option) => option.isDisabled}
        {...props}
      />
    );
  }
);
export default ProductsAndCoursesSelect;
