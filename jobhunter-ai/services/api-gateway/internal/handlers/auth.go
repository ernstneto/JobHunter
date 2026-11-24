package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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

// RefreshRequest é o body esperado no endpoint /auth/refresh.
type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" binding:"required"`
}

// RefreshToken valida o refresh token (assinatura + expiração) e emite um
// novo access token. Sem persistência: o refresh token é um JWT válido, e
// o novo access token é gerado com as mesmas claims (mock de auth atual).
func (h *AuthHandler) RefreshToken(c *gin.Context) {
	var req RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request", "details": err.Error()})
		return
	}

	token, err := jwt.ParseWithClaims(req.RefreshToken, &middleware.Claims{}, func(t *jwt.Token) (interface{}, error) {
		if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, jwt.ErrSignatureInvalid
		}
		return []byte(h.cfg.JWTSecret), nil
	})
	if err != nil || !token.Valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid or expired refresh token"})
		return
	}

	claims, ok := token.Claims.(*middleware.Claims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token claims"})
		return
	}

	accessToken, err := middleware.GenerateToken(
		claims.UserID, claims.Email, claims.TenantID,
		h.cfg.JWTSecret, h.cfg.JWTExpirationHours,
	)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to issue access token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": accessToken,
		"token_type":   "Bearer",
		"expires_in":   h.cfg.JWTExpirationHours * 3600,
	})
}