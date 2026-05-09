package prober

import (
	"crypto/tls"
	"fmt"
	"net/http"
	"net/http/httptrace"
	"os"
	"time"
)

func TraceURL(url string) (*ProbeMetrics, error) {
	var dnsStart, dnsDone, connStart, connDone, tlsStart, tlsDone, firstByte time.Time

	req, _ := http.NewRequest("GET", url, nil)

	trace := &httptrace.ClientTrace{
		DNSStart: func(_ httptrace.DNSStartInfo) {
			dnsStart =
				time.Now()
		},
		DNSDone: func(_ httptrace.DNSDoneInfo) {
			dnsDone =
				time.Now()
		},
		ConnectStart: func(_, _ string) {
			connStart =
				time.Now()
		},
		ConnectDone: func(_, _ string, _ error) {
			connDone =
				time.Now()
		},
		TLSHandshakeStart: func() {
			tlsStart =
				time.Now()
		},
		TLSHandshakeDone: func(_ tls.ConnectionState, _ error) {
			tlsDone =
				time.Now()
		},
		GotFirstResponseByte: func() {
			firstByte =
				time.Now()
		},
	}

	req = req.WithContext(httptrace.WithClientTrace(req.Context(), trace))
	start := time.Now()
	
	client := &http.Client{
		Timeout: 30 * time.Second,
	}
	
	resp, err := client.Do(req)
	if err != nil {
		fmt.Fprintf(os.Stderr, "[DIAGNOSTIC] Request failed for %s: %v\n", url, err)
		return nil, fmt.Errorf("request failed: %w", err)
	}
	defer resp.Body.Close()
	total := time.Since(start)

	return &ProbeMetrics{
		DNS:        dnsDone.Sub(dnsStart),
		TCP:        connDone.Sub(connStart),
		TLS:        tlsDone.Sub(tlsStart),
		TTFB:       firstByte.Sub(connDone),
		Total:      total,
		StatusCode: resp.StatusCode,
	}, nil

}
