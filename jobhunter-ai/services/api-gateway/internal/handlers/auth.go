package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
	"github.com/jobhunter-ai/api-gateway/internal/middleware"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	cfg *config.Config
}

func NewAuthHandler(cfg *config.Config) *AuthHandler {
	return &AuthHandler{cfg: cfg}
}

type RegisterRequest struct {
	Name     string `json:"name" binding:"required,min=2"`
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required,min=8"`
}

type LoginRequest struct {
	Email    string `json:"email" binding:"required,email"`
	Password string `json:"password" binding:"required"`
}

func (h *AuthHandler) Register(c *gin.Context) {
	var req RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	hashed, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to process password"})
		return
	}
	_ = hashed // TODO: save to DB

	userID := "usr_mock_001"
	tenantID := "tenant_default"

	accessToken, _ := middleware.GenerateToken(userID, req.Email, tenantID, h.cfg.JWTSecret, h.cfg.JWTExpirationHours)
	refreshToken, _ := middleware.GenerateToken(userID, req.Email, tenantID, h.cfg.JWTSecret, h.cfg.JWTExpirationHours*7)

	c.JSON(http.StatusCreated, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"expires_in":    h.cfg.JWTExpirationHours * 3600,
		"user": gin.H{
			"id":    userID,
			"name":  req.Name,
			"email": req.Email,
		},
	})
}

func (h *AuthHandler) Login(c *gin.Context) {
	var req LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	// TODO: verify password against DB
	userID := "usr_mock_001"
	tenantID := "tenant_default"

	accessToken, _ := middleware.GenerateToken(userID, req.Email, tenantID, h.cfg.JWTSecret, h.cfg.JWTExpirationHours)
	refreshToken, _ := middleware.GenerateToken(userID, req.Email, tenantID, h.cfg.JWTSecret, h.cfg.JWTExpirationHours*7)

	c.JSON(http.StatusOK, gin.H{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"token_type":    "Bearer",
		"expires_in":    h.cfg.JWTExpirationHours * 3600,
		"user": gin.H{
			"id":    userID,
			"email": req.Email,
		},
	})
}

func (h *AuthHandler) RefreshToken(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"message": "Token refreshed"})
}