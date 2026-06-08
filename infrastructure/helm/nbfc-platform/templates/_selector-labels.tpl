{{/*
NBFC Platform Service Selector Labels
*/}}
{{- define "nbfc.selectorLabels" -}}
app.kubernetes.io/name: {{ .name }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end -}}