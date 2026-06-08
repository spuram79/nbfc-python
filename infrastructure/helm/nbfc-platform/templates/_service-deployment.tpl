{{/*
NBFC Platform Service Deployment Template
*/}}
{{- define "nbfc.service.deployment" -}}
apiVersion: apps/v1
kind: Deployment
metadata:
  name: {{ .name }}
  namespace: {{ .namespace }}
  labels:
    {{- include "nbfc.labels" . | nindent 4 }}
spec:
  replicas: {{ .replicaCount }}
  selector:
    matchLabels:
      app: {{ .name }}
  template:
    metadata:
      labels:
        app: {{ .name }}
        {{- include "nbfc.selectorLabels" . | nindent 8 }}
    spec:
      containers:
        - name: {{ .name }}
          image: "{{ .image.repository }}/{{ .name }}:{{ .image.tag }}"
          imagePullPolicy: {{ .image.pullPolicy }}
          ports:
            - containerPort: {{ .port }}
          env:
            - name: NODE_ENV
              value: {{ .env.NODE_ENV | quote }}
            - name: JWT_SECRET
              valueFrom:
                secretKeyRef:
                  name: {{ .secretName }}
                  key: JWT_SECRET
            - name: DATABASE_URL
              valueFrom:
                secretKeyRef:
                  name: {{ .secretName }}
                  key: DATABASE_URL
            - name: REDIS_URL
              valueFrom:
                secretKeyRef:
                  name: {{ .secretName }}
                  key: REDIS_URL
            - name: KAFKA_BROKERS
              valueFrom:
                secretKeyRef:
                  name: {{ .secretName }}
                  key: KAFKA_BROKERS
            {{- with .extraEnv }}
            {{- toYaml . | nindent 12 }}
            {{- end }}
          resources:
            requests:
              memory: {{ .resources.requests.memory }}
              cpu: {{ .resources.requests.cpu }}
            limits:
              memory: {{ .resources.limits.memory }}
              cpu: {{ .resources.limits.cpu }}
          livenessProbe:
            httpGet:
              path: /api/health
              port: {{ .port }}
            initialDelaySeconds: 30
            periodSeconds: 10
          readinessProbe:
            httpGet:
              path: /api/health
              port: {{ .port }}
            initialDelaySeconds: 5
            periodSeconds: 5
{{- end -}}