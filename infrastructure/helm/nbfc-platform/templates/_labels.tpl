{{/*
NBFC Platform Labels
*/}}
{{- define "nbfc.labels" -}}
helm.sh/chart: {{ .chart.Name }}-{{ .chart.Version | replace "+" "_" }}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .Release.Name }}
app.kubernetes.io/version: {{ .chart.AppVersion }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end -}}