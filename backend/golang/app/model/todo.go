package model

import (
	"time"

	"github.com/km1110/calendar-app/backend/golang/view/response"
)

type TodoModel struct {
}

func NewTodoModel() *TodoModel {
	return &TodoModel{}
}

func (tm *TodoModel) GetTodos(firebase_uid string) ([]*response.TodosResponse, error) {
	sql := `select id from users where firebase_uid = ?`

	var user_id string
	if err := Db.QueryRow(sql, firebase_uid).Scan(&user_id); err != nil {
		return nil, err
	}

	sql = `
				SELECT 
						t.id, 
						t.name, 
						t.date, 
						t.status, 
						p.id AS project_id, 
						p.title AS project_title, 
						tg.id AS tag_id, 
						tg.name AS tag_name
				FROM 
						todos t
				LEFT JOIN 
						projects p ON t.project_id = p.id
				LEFT JOIN 
						tags tg ON t.tag_id = tg.id
				WHERE 
						t.user_id = ?
				`

	rows, err := Db.Query(sql, user_id)
	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var todos []*response.TodosResponse

	for rows.Next() {
		var (
			id, name, project_id, project_title, tag_id, tag_name string
			date                                                  time.Time
			status                                                bool
		)

		if err := rows.Scan(&id, &project_id, &tag_id, &name, &date, &status); err != nil {
			return nil, err
		}

		todos = append(todos, &response.TodosResponse{
			Id:   id,
			Name: name,
			Date: date,
			Project: response.ProjectResponse{
				Id:    project_id,
				Title: project_title,
			},
			Tag: response.TagResponse{
				Id:   tag_id,
				Name: tag_name,
			},
		})
	}

	return todos, nil
}