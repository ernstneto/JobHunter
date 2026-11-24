package handlers

import (
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/jobhunter-ai/api-gateway/internal/config"
)

// proxyRequest repassa a requisicao para o ai-service (FastAPI) e retorna a
// resposta com o mesmo status. Copia method, query params, body e os headers
// Content-Type/Authorization, e aplica timeout para evitar travamentos.
func proxyRequest(cfg *config.Config, c *gin.Context, path string) {
	aiURL := fmt.Sprintf("%s%s", cfg.AIServiceURL, path)
	if q := c.Request.URL.RawQuery; q != "" {
		aiURL += "?" + q
	}

	var body io.Reader
	if c.Request.Body != nil && c.Request.Method != http.MethodGet {
		body = c.Request.Body
	}

	req, err := http.NewRequestWithContext(c.Request.Context(), c.Request.Method, aiURL, body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Invalid proxy request"})
		return
	}

	if ct := c.GetHeader("Content-Type"); ct != "" {
		req.Header.Set("Content-Type", ct)
	}
	if auth := c.GetHeader("Authorization"); auth != "" {
		req.Header.Set("Authorization", auth)
	}

	client := &http.Client{Timeout: 60 * time.Second}
	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "AI service unavailable", "detail": err.Error()})
		return
	}
	defer resp.Body.Close()

	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		c.JSON(http.StatusBadGateway, gin.H{"error": "Failed to read AI service response"})
		return
	}

	c.Data(resp.StatusCode, "application/json", respBody)
}
