package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
)

type ApplicationHandler struct {
	cfg *config.Config
}

func NewApplicationHandler(cfg *config.Config) *ApplicationHandler {
	return &ApplicationHandler{cfg: cfg}
}

func (h *ApplicationHandler) List(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"applications": []gin.H{},
		"total":        0,
		"stats": gin.H{
			"applied": 0, "interview": 0, "rejected": 0, "pending": 0,
		},
	})
}

func (h *ApplicationHandler) Create(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Application created"})
}

func (h *ApplicationHandler) UpdateStatus(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"id": c.Param("id"), "message": "Status updated"})
}