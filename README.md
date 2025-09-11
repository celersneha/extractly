# Extractly - PDF Invoice Management Platform

**AI-powered PDF invoice extraction and management system**

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/extractly)

## 🚀 Live Demo

- **Web App**: [extractly-psi.vercel.app](https://extractly-psi.vercel.app)
- **API**: [extractly-api.vercel.app](https://extractly-api.vercel.app)

## 🏗️ Architecture

This is a production-ready monorepo featuring:

- **Backend API** (Express.js + TypeScrip)
- **Frontend Web App** (Next.js 15 + App Router + TypeScript + Tailwind CSS + Shadcn)
- **AI Integration** (Gemini API for intelligent data extraction)
- **File Storage** (Vercel Blob for PDF storage)
- **Database** (MongoDB with Mongoose ODM)

## 🚀 Quick Setup

### Prerequisites

- Node.js 18+ and npm
- MongoDB database (local or cloud)
- Gemini API key
- Vercel Blob Token

### Backend Setup

```bash
cd apps/api
npm install
npm run dev
```

### Frontend Setup

```bash
cd apps/web
npm install
npm run dev
```

## 🔧 Environment Variables

### Backend (`apps/api/.env.local`)

```env
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/extractly

# AI Service (choose one)
GEMINI_API_KEY=AIzaSy...                    # Google Gemini API
GROQ_API_KEY=gsk_...                        # Groq API

# Server
PORT=8000
NODE_ENV=development

# Vercel Blob (for file storage)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

### Frontend (`apps/web/.env.local`)

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# For production
# NEXT_PUBLIC_API_URL=https://extractly-api.vercel.app
```

## 🏃‍♂️ Running Locally

1. **Clone and install dependencies:**

   ```bash
   git clone <your-repo-url>
   cd pdf-dashboard
   ```

2. **Setup Backend:**

   ```bash
   cd apps/api
   npm install
   # Add .env.local with required variables
   npm run dev  # Starts on http://localhost:8000
   ```

3. **Setup Frontend:**

   ```bash
   cd apps/web
   npm install
   # Add .env.local with API URL
   npm run dev  # Starts on http://localhost:3000
   ```

4. **Visit the application:**
   - Frontend: http://localhost:3000
   - API: http://localhost:8000

## 🌐 Deployed URLs

- **Frontend**: https://extractly-psi.vercel.app
- **Backend API**: https://extractly-api.vercel.app

## ## 📋 API Documentation

### Base URL

- **Local**: `http://localhost:8000/api/v1`
- **Production**: `https://extractly-api.vercel.app/api/v1`

### Authentication

Currently, no authentication is required. All endpoints are publicly accessible.

### File Upload & AI Extraction

#### Upload PDF File

```http
POST /upload
Content-Type: multipart/form-data

Body: file (PDF, max 25MB)
```

**Response:**

```json
{
  "success": true,
  "data": {
    "fileId": "1757556510633_Invoice.pdf",
    "fileName": "Invoice.pdf",
    "fileUrl": "https://rwiuavssfulb8mj3.public.blob.vercel-storage.com/invoices/1757556510633_Invoice.pdf",
    "fileSize": 245760
  },
  "message": "PDF uploaded successfully"
}
```

#### Extract Invoice Data with AI

```http
POST /extract
Content-Type: application/json

{
  "fileId": "1757556510633_Invoice_by_Shubh_Verma.pdf",
  "fileName": "Invoice by Shubh Verma.pdf",
  "model": "gemini"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "vendor": {
      "name": "GOOD COMPANY",
      "address": "123 Somewhere St., Any City",
      "taxId": ""
    },
    "invoice": {
      "number": "GC12750197",
      "date": "2024-04-15",
      "currency": "INR",
      "subtotal": 700,
      "taxPercent": 0,
      "total": 700,
      "poNumber": "",
      "poDate": "",
      "lineItems": [
        {
          "description": "Masterclass",
          "unitPrice": 100,
          "quantity": 1,
          "total": 100
        },
        {
          "description": "Logo Design",
          "unitPrice": 100,
          "quantity": 1,
          "total": 100
        }
      ]
    }
  }
}
```

### Invoice CRUD Operations

#### Get All Invoices

```http
GET /invoices?page=1&limit=10&q=search_term
```

**Response:**

```json
{
  "success": true,
  "data": {
    "invoices": [
      {
        "_id": "68c22f3590c05ee03375e8ff",
        "fileId": "1757556510633_Invoice_by_Shubh_Verma.pdf",
        "fileName": "Invoice by Shubh Verma.pdf",
        "vendor": {
          "name": "GOOD COMPANY",
          "address": "123 Somewhere St., Any City"
        },
        "invoice": {
          "number": "GC12750197",
          "date": "2024-04-15",
          "currency": "INR",
          "total": 700,
          "lineItems": [...]
        },
        "createdAt": "2025-01-11T02:08:53.812Z",
        "updatedAt": "2025-01-11T02:08:53.812Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 42,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

#### Get Single Invoice

```http
GET /invoices/{id}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "68c22f3590c05ee03375e8ff",
    "fileId": "1757556510633_Invoice_by_Shubh_Verma.pdf",
    "fileName": "Invoice by Shubh Verma.pdf",
    "vendor": {
      "name": "GOOD COMPANY",
      "address": "123 Somewhere St., Any City",
      "taxId": ""
    },
    "invoice": {
      "number": "GC12750197",
      "date": "2024-04-15",
      "currency": "INR",
      "subtotal": 700,
      "taxPercent": 0,
      "total": 700,
      "lineItems": [
        {
          "description": "Masterclass",
          "unitPrice": 100,
          "quantity": 1,
          "total": 100
        }
      ]
    },
    "createdAt": "2025-01-11T02:08:53.812Z",
    "updatedAt": "2025-01-11T02:08:53.812Z"
  }
}
```

#### Create New Invoice

```http
POST /invoices
Content-Type: application/json

{
  "fileId": "1757556510633_Invoice_by_Shubh_Verma.pdf",
  "fileName": "Invoice by Shubh Verma.pdf",
  "vendor": {
    "name": "GOOD COMPANY",
    "address": "123 Somewhere St., Any City",
    "taxId": ""
  },
  "invoice": {
    "number": "GC12750197",
    "date": "2024-04-15",
    "currency": "INR",
    "subtotal": 700,
    "taxPercent": 0,
    "total": 700,
    "poNumber": "",
    "poDate": "",
    "lineItems": [
      {
        "description": "Masterclass",
        "unitPrice": 100,
        "quantity": 1,
        "total": 100
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "68c22f3590c05ee03375e8ff",
    "fileId": "1757556510633_Invoice_by_Shubh_Verma.pdf",
    "fileName": "Invoice by Shubh Verma.pdf",
    "vendor": {
      /* vendor data */
    },
    "invoice": {
      /* invoice data */
    },
    "createdAt": "2025-01-11T02:08:53.812Z",
    "updatedAt": "2025-01-11T02:08:53.812Z"
  },
  "message": "Invoice created successfully"
}
```

#### Update Invoice

```http
PUT /invoices/{id}
Content-Type: application/json

{
  "vendor": {
    "name": "Updated Company Name",
    "address": "New Address"
  },
  "invoice": {
    "number": "UPDATED123",
    "date": "2024-04-16",
    "currency": "USD",
    "total": 850
  }
}
```

#### Delete Invoice

```http
DELETE /invoices/{id}
```

**Response:**

```json
{
  "success": true,
  "message": "Invoice deleted successfully"
}
```

### Error Responses

All API endpoints return consistent error responses:

```json
{
  "success": false,
  "status": 400,
  "message": "Validation error message"
}
```

**Common Status Codes:**

- `400` - Bad Request (validation errors)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error
- `413` - Payload Too Large (file size exceeded)

### 🛠️ Tech Stack

#### Backend

- **Express.js**
- **TypeScript**
- **MongoDB + Mongoose**
- **Vercel Blob**
- **Gemini**
- **CORS**

#### Frontend

- **Next.js 15**
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui**
- **React Hook Form**
- **Sonner**
- **Lucide React**
- **PDF.js**

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** installed
- **npm** package manager
- **MongoDB** database (local or cloud like MongoDB Atlas)
- **AI API Key** (Gemini or Groq)
- **Vercel Account** (for Blob storage token)

## 🌐 Deployment

## 📱 Usage

### Upload & Extract Workflow

1. **Upload PDF**: Click "Upload PDF" and select your invoice file
2. **AI Extraction**: Use "Extract with AI" to automatically extract invoice data
3. **Review & Edit**: Review and edit the extracted information
4. **Save Invoice**: Save the invoice to your database
5. **View & Manage**: View all invoices with search and filtering capabilities
