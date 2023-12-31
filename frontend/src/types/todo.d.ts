import dayjs from "dayjs";
import { tagType, projectType } from "@/types/project";

export interface todoType {
  id: string;
  name: string;
  tag: tagType;
  date: dayjs.Dayjs;
  project: projectType;
  status: boolean;
}

export interface todoDayRatioType {
  date: dayjs.Dayjs;
  ratio: int;
}
