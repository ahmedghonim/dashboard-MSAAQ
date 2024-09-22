import { Dispatch, SetStateAction } from "react";

export const handleMouseEnter = (
  data: any[],
  index: number,
  setNewDonutChartData: Dispatch<React.SetStateAction<any[]>>,
  setSectionActive: Dispatch<React.SetStateAction<boolean>>,
  setLegendIndex: Dispatch<React.SetStateAction<number | null>>
) => {
  setSectionActive(true);
  const updatedData = data.map((item: any, i: number) => {
    setLegendIndex(index);
    if (i !== index) {
      return {
        ...item,
        opacity: 0.3
      };
    }
    return item;
  });
  setNewDonutChartData(updatedData);
};

export const handleMouseLeave = (
  data: any[],
  setNewDonutChartData: Dispatch<React.SetStateAction<any[]>>,
  setLegendIndex: Dispatch<React.SetStateAction<number | null>>
) => {
  const updatedData = data.map((item: any) => {
    setLegendIndex(null);
    return {
      ...item,
      opacity: 1
    };
  });
  setNewDonutChartData(updatedData);
};
