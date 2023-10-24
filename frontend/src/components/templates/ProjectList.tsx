import { todoType } from "@/types/todo";
import { CheckBox, Edit } from "@mui/icons-material";
import { Box, Button, Card, Grid, IconButton, Typography } from "@mui/material";
import React, { useState } from "react";
import { AddTodoDialog } from "./AddTodoDialog";
import { projectType } from "@/types/project";

type Props = {
  projects: any;
};

export const ProjectList = ({ projects }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <Box
      marginTop="20px"
      marginLeft="10%"
      width="50%"
      height="30%"
      display="flex"
      flexDirection="column"
      alignItems="center"
    >
      <Card variant="outlined" sx={{ width: "100%", border: "1px solid" }}>
        <Box
          display="flex"
          flexDirection="row"
          sx={{ borderBottom: "1px solid" }}
        >
          <Typography
            variant="h5"
            sx={{ flexGrow: 1, marginTop: "1%", marginLeft: "2%" }}
          >
            Project
          </Typography>
          <Button onClick={() => setIsOpen(true)}>追加</Button>
          <AddTodoDialog isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </Box>
        <Box sx={{ borderBottom: "1px solid" }}>
          <Grid container>
            <Grid item xs={3}>
              <Typography variant="h6" sx={{ marginLeft: "10px" }}>
                進捗率
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="h6">プロジェクト名</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography variant="h6">タスク数</Typography>
            </Grid>
          </Grid>
        </Box>
        {projects.map((item: projectType, index: number) => (
          <Grid
            container
            // spacing={3}
            key={index}
            alignItems="center"
            style={{ minHeight: "40px" }}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
          >
            <Grid item xs={3}>
              <Typography sx={{ marginLeft: "10px" }}>
                <CheckBox />
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography>{item.title}</Typography>
            </Grid>
            <Grid item xs={2}>
              <Typography>{item.num}</Typography>
            </Grid>
            <Grid item xs={1}>
              {hoveredIndex === index && (
                <IconButton>
                  <Edit />
                </IconButton>
              )}
            </Grid>
          </Grid>
        ))}
      </Card>
    </Box>
  );
};