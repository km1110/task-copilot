package controller

import (
	"fmt"
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/km1110/calendar-app/backend/golang/model"
	"github.com/km1110/calendar-app/backend/golang/view/request"
	"github.com/km1110/calendar-app/backend/golang/view/response"
)

type TodoController interface {
	FetchTodo(c *gin.Context)
	FetchTodoCount(c *gin.Context)
	CreateTodo(c *gin.Context)
	UpdateTodo(c *gin.Context)
	UpdateTodoStatus(c *gin.Context)
	DeleteTodo(c *gin.Context)
}

type todoController struct {
	tm model.TodoModel
	um model.UserModel
}

func NewTodoController(tm model.TodoModel, um model.UserModel) TodoController {
	return &todoController{tm, um}
}

func (tc todoController) FetchTodo(c *gin.Context) {
	firebaseUID, exists := c.Get("firebaseUID")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "firebaseUID not provided"})
		return
	}

	userID, err := tc.um.GetUser(firebaseUID.(string))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	start_date := c.Query("start_date")
	end_date := c.Query("end_date")

	var todos []*response.TodosResponse

	if start_date != "" {
		todos, err = tc.tm.GetDailyTodos(userID, start_date, end_date)
	} else {
		todos, err = tc.tm.GetTodos(userID)
	}

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, todos)
}

func (tc todoController) FetchTodoCount(c *gin.Context) {
	firebaseUID, exists := c.Get("firebaseUID")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "firebaseUID not provided"})
		return
	}

	userID, err := tc.um.GetUser(firebaseUID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	start := c.Query("start")
	end := c.Query("end")

	startYear := fmt.Sprintf("%s-01-01", start)
	endYear := fmt.Sprintf("%s-01-01", end)

	res, err := tc.tm.GetDateCount(userID, startYear, endYear)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	rm := model.NewRatioModel()
	resRatio, _ := rm.GetRatio(res, startYear, endYear)

	c.JSON(http.StatusOK, resRatio)
}

func (tc todoController) CreateTodo(c *gin.Context) {
	var req request.CreateTodoRequest

	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	firebaseUID, exists := c.Get("firebaseUID")
	if !exists {
		c.JSON(http.StatusBadRequest, gin.H{"error": "firebaseUID not provided"})
		return
	}

	userID, err := tc.um.GetUser(firebaseUID.(string))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	res, err := tc.tm.AddTodos(c, userID, req)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (tc todoController) UpdateTodo(c *gin.Context) {
	// Requestボディのバリデーション
	var req request.UpdateTodoRequest

	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := c.Param("todo_id")

	res, err := tc.tm.UpdateTodos(c, response.TodosResponse{
		Id:      id,
		Name:    req.Name,
		Date:    req.Date,
		Status:  req.Status,
		Project: response.ProjectsResponse(req.Project),
		Tag:     response.TagResponse(req.Tag),
	})

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (tc todoController) UpdateTodoStatus(c *gin.Context) {
	var req request.UpdateTodoStatusRequest

	if err := c.Bind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	id := c.Param("todo_id")

	res, err := tc.tm.UpdateTodoStatus(c, id, req)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, res)
}

func (tc todoController) DeleteTodo(c *gin.Context) {
	id := c.Param("todo_id")

	err := tc.tm.DeleteTodo(c, id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{})
}
