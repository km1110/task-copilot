import { useEffect, useState } from "react";

import { Box } from "@mui/material";
import dayjs from "dayjs";
import { useRecoilState } from "recoil";

import { Contribution } from "@/components/templates/Contribution";
import { DailyTodoList } from "@/components/templates/DailyTodoList";
import { DiaryCard } from "@/components/templates/DiaryCard";
import { makeInstance } from "@/libs/api/axios";
import { pageState } from "@/atoms/pageState";
import { tagState } from "@/atoms/tagState";
import { projectState } from "@/atoms/projectState";
import { todoDayRatioType, todoType } from "@/types/todo";
import { tagType } from "@/types/tag";
import { projectsType } from "@/types/project";
import { diaryType } from "@/types/diary";
import { useDiary } from "@/hooks/useDiary";
import { diaryState } from "@/atoms/diaryState";

export const MainView = () => {
  const [page, setPage] = useRecoilState<string>(pageState);
  const [tags, setTags] = useRecoilState<tagType[]>(tagState);
  const [projects, setProjects] = useRecoilState<projectsType[]>(projectState);
  const [diary, setDiary] = useRecoilState<diaryType>(diaryState);

  const [dayRatio, setDayRatio] = useState<todoDayRatioType[]>([]);
  const [todo, setTodo] = useState<todoType>({
    id: "",
    name: "",
    tag: {
      id: "",
      name: "",
    },
    project: {
      id: "",
      title: "",
    },
    date: dayjs(),
    status: false,
  });
  const [todos, setTodos] = useState<todoType[]>([]);

  const instance = makeInstance();

  const { handleFetchDiary, handleCreateDiary, handleUpdateDiary } =
    useDiary("diary");

  // 進捗の取得
  useEffect(() => {
    setPage("main");
    // 今年と来年の年を取得
    const currentYear = dayjs().year();
    const startYear = currentYear.toString();
    const endYear = (currentYear + 1).toString();

    const fetchData = async () => {
      try {
        const dayRatio = await instance.get("/todos/day-count", {
          params: {
            start: startYear,
            end: endYear,
          },
        });
        setDayRatio(dayRatio.data);
      } catch (error) {
        console.error("An error occurred while fetching the todo:", error);
      }
    };
    fetchData();
  }, []);

  // TODOの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const todos = await instance.get("/todos", {
          params: {
            start_date: dayjs(todo.date).format("YYYY-MM-DD"),
            end_date: dayjs(todo.date).add(1, "day").format("YYYY-MM-DD"),
          },
        });
        setTodos(todos.data);
      } catch (error) {
        console.error("An error occurred while fetching the todo:", error);
      }
    };
    fetchData();
  }, []);

  // タグの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const tags = await instance.get("/tags");
        setTags(tags.data);
      } catch (error) {
        console.error("An error occurred while fetching the tags:", error);
      }
    };
    fetchData();
  }, []);

  // プロジェクトの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projects = await instance.get("/projects");
        setProjects(projects.data);
      } catch (error) {
        console.error("An error occurred while fetching the project:", error);
      }
    };
    fetchData();
  }, []);

  // 日記の取得
  useEffect(() => {
    const fetchData = async () => {
      const start = dayjs(diary.date).format("YYYY-MM-DD");
      const end = dayjs(diary.date).add(1, "day").format("YYYY-MM-DD");
      try {
        await handleFetchDiary(start, end);
      } catch (error) {
        console.error("An error occurred while fetching the diary:", error);
      }
    };
    fetchData();
  }, []);

  // todoの作成
  const handleCreate = async () => {
    const body = {
      name: todo.name,
      tag: todo.tag,
      date: dayjs(todo.date),
      project: todo.project,
      status: todo.status,
    };
    await instance.post("/todos", body);
    instance
      .get("/todos", {
        params: {
          start_date: dayjs(todo.date).format("YYYY-MM-DD"),
          end_date: dayjs(todo.date).add(1, "day").format("YYYY-MM-DD"),
        },
      })
      .then(({ data }) => {
        setTodos(data);
      });

    setTodo({
      id: "",
      name: "",
      tag: { id: "", name: "" },
      date: dayjs(),
      project: { id: "", title: "" },
      status: false,
    });
  };

  // todoの更新
  const handleUpdate = async () => {
    const body = {
      name: todo.name,
      tag: todo.tag,
      date: dayjs(todo.date),
      project: todo.project,
      status: todo.status,
    };
    await instance.patch(`/todos/${todo.id}`, body);
    instance
      .get("/todos", {
        params: {
          start_date: dayjs(todo.date).format("YYYY-MM-DD"),
          end_date: dayjs(todo.date).add(1, "day").format("YYYY-MM-DD"),
        },
      })
      .then(({ data }) => {
        setTodos(data);
      });

    setTodo({
      id: "",
      name: "",
      tag: { id: "", name: "" },
      date: dayjs(),
      project: { id: "", title: "" },
      status: false,
    });
  };

  const handleUpdateStatus = async (itemId: string) => {
    let newStatus;
    const newTodos = todos.map((item) => {
      if (item.id === itemId) {
        newStatus = !item.status;
        return { ...item, status: newStatus };
      } else {
        return item;
      }
    });
    setTodos(newTodos);

    await instance
      .patch(`/todos/${itemId}/status`, {
        status: newStatus,
      })
      .catch((error) => {
        console.error("An error occurred while updating the status:", error);
      });
  };

  // todoの削除
  const handleDelete = async (id: string) => {
    await instance
      .delete(`/todos/${id}`)
      .then(() => {
        instance
          .get("/todos", {
            params: {
              start_date: dayjs(todo.date).format("YYYY-MM-DD"),
              end_date: dayjs(todo.date).add(1, "day").format("YYYY-MM-DD"),
            },
          })
          .then(({ data }) => {
            setTodos(data);
          });
      })
      .catch((error) => {
        console.error("An error occurred while deleting the todo:", error);
      });

    setTodo({
      id: "",
      name: "",
      tag: { id: "", name: "" },
      date: dayjs(),
      project: { id: "", title: "" },
      status: false,
    });
  };

  const handleDiary = async (diary: diaryType) => {
    const start = dayjs(todo.date).format("YYYY-MM-DD");
    const end = dayjs(todo.date).add(1, "day").format("YYYY-MM-DD");

    if (diary.id) {
      await handleUpdateDiary(diary, start, end);
    } else {
      await handleCreateDiary(diary, start, end);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Contribution dayRatio={dayRatio} />
      <Box display="flex" flexDirection="row" gap="20px">
        <DailyTodoList
          todo={todo}
          todos={todos}
          tags={tags}
          projects={projects}
          setTodo={setTodo}
          handleCreate={handleCreate}
          handleUpdate={handleUpdate}
          handleUpdateStatus={handleUpdateStatus}
          handleDelete={handleDelete}
        />
        <DiaryCard
          diary={diary}
          setDiary={setDiary}
          handleDiary={handleDiary}
        />
      </Box>
    </Box>
  );
};
