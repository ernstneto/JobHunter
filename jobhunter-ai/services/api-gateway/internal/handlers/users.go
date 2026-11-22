package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
)

type UserHandler struct {
	cfg *config.Config
}

func NewUserHandler(cfg *config.Config) *UserHandler {
	return &UserHandler{cfg: cfg}
}

func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, _ := c.Get("user_id")
	c.JSON(http.StatusOK, gin.H{
		"id":    userID,
		"name":  "John Doe",
		"email": "john@example.com",
		"profile": gin.H{
			"hard_skills":         []string{"Python", "Go", "TypeScript", "Docker"},
			"soft_skills":         []string{"Leadership", "Communication"},
			"years_of_experience": 5,
			"target_roles":        []string{"Backend Developer", "DevOps Engineer"},
		},
	})
}

func (h *UserHandler) UpdateProfile(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Profile updated"})
}