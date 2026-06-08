# Diagrams Directory

This folder contains technical architecture and process diagrams for the NBFC-Python application.

## File Formats

- **`.drawio`** - Native draw.io / diagrams.net format (XML-based)
- Open these files directly at [app.diagrams.net](https://app.diagrams.net) or use the draw.io desktop app

## Available Diagrams

| Diagram | Description |
|---------|-------------|
| `Architecture.drawio` | High-level system architecture showing all services and data flow |
| `ComponentArchitecture.drawio` | Detailed component architecture with modules and interfaces |
| `PersonalLoanProcess.drawio` | Business process flow for personal loan processing |
| `LoanDisposalProcess.drawio` | NPA identification, recovery, and loan disposal workflow |

## Creating New Diagrams

1. Go to [app.diagrams.net](https://app.diagrams.io)
2. Create your diagram using the style guide below
3. Save with `.drawio` extension
4. Export to PNG/PDF for documentation if needed

## Style Guide

### Colors
- **Business Layer**: Blue (#2196F3)
- **Services Layer**: Orange (#FF9800)
- **Data Layer**: Green (#4CAF50)
- **External Services**: Purple (#9C27B0)
- **Decisions/Branches**: Yellow (#FFC107)
- **Terminators**: Green/Red circles for start/end

### Shapes
- **Rounded rectangles**: Components and services
- **Ellipses**: Start/End points
- **Diamonds**: Decision points
- **Arrows**: Data/control flow
