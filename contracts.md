# JATES9 Ecosystem - API Contracts & Integration Guide

## Overview
Dokumen ini berisi kontrak API dan panduan integrasi antara frontend dan backend untuk aplikasi JATES9 Ecosystem.

---

## 1. MOCK DATA YANG PERLU DIGANTI

### Frontend Mock Data (mock.js)
Semua data di `/app/frontend/src/mock.js` perlu diganti dengan API calls:

1. **healthQuestions** - Kuis kesehatan (bisa hardcoded di backend/frontend, tidak perlu API)
2. **challengeDays** - Data challenge 30 hari (bisa hardcoded, tidak perlu API)
3. **productInfo** - Info produk Jates9 (bisa hardcoded atau dari CMS)
4. **aiChatMock** - Chat history akan diganti dengan API real-time
5. **userProfileMock** - User profile akan diganti dengan session-based data

### LocalStorage yang Digunakan (Temporary)
- `quizResult` - Hasil kuis kesehatan user
- `challengeEnrolled` - Status enrollment challenge
- `challengeStartDate` - Tanggal mulai challenge

---

## 2. API ENDPOINTS YANG DIBUTUHKAN

### 2.1 Health Quiz API

#### POST /api/quiz/submit
**Purpose**: Menyimpan hasil kuis kesehatan user
**Request Body**:
```json
{
  "phone_number": "081234567890",
  "name": "John Doe",
  "answers": {
    "1": "always",
    "2": "constipation",
    "3": "yes_always",
    "4": "years"
  },
  "score": 8,
  "health_type": "A",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

**Response**:
```json
{
  "success": true,
  "user_id": "user_12345",
  "recommendation": "Program 30 Hari untuk Tipe A - Sembelit",
  "suggested_product": "jates9_premium"
}
```

#### GET /api/quiz/result/{user_id}
**Purpose**: Mendapatkan hasil kuis user
**Response**:
```json
{
  "score": 8,
  "health_type": "A",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

### 2.2 Challenge API

#### POST /api/challenge/enroll
**Purpose**: Mendaftarkan user ke Program 30 Hari
**Request Body**:
```json
{
  "user_id": "user_12345",
  "phone_number": "081234567890",
  "name": "John Doe",
  "health_type": "A",
  "start_date": "2025-01-15"
}
```

**Response**:
```json
{
  "success": true,
  "challenge_id": "challenge_67890",
  "start_date": "2025-01-15",
  "whatsapp_confirmed": true,
  "message": "Selamat! Anda telah terdaftar. Cek WhatsApp untuk instruksi."
}
```

#### GET /api/challenge/progress/{user_id}
**Purpose**: Mendapatkan progress challenge user
**Response**:
```json
{
  "current_day": 5,
  "completed_tasks": 12,
  "total_tasks": 90,
  "streak_days": 5,
  "next_task": {
    "day": 5,
    "time": "morning",
    "task": "Minum 2 gelas air hangat",
    "completed": false
  }
}
```

#### POST /api/challenge/checkin
**Purpose**: User check-in daily task
**Request Body**:
```json
{
  "user_id": "user_12345",
  "day": 5,
  "time": "morning",
  "task_completed": true,
  "notes": "Sudah minum 2 gelas air"
}
```

**Response**:
```json
{
  "success": true,
  "streak_days": 5,
  "next_task": "Kunyah makanan 20x sebelum menelan"
}
```

---

### 2.3 AI Chat API

#### POST /api/chat/message
**Purpose**: Mengirim pesan ke AI dan mendapat response
**Request Body**:
```json
{
  "user_id": "user_12345",
  "session_id": "session_abc123",
  "message": "Saya sering maag, apa yang harus saya lakukan?"
}
```

**Response**:
```json
{
  "success": true,
  "response": "Berdasarkan gejala yang Anda sebutkan, kemungkinan Anda mengalami masalah maag...",
  "session_id": "session_abc123"
}
```

#### GET /api/chat/history/{user_id}
**Purpose**: Mendapatkan chat history user
**Query Params**: `?session_id=session_abc123` (optional)
**Response**:
```json
{
  "messages": [
    {
      "role": "assistant",
      "content": "Halo! Saya Doktor AI...",
      "timestamp": "2025-01-15T10:30:00Z"
    },
    {
      "role": "user",
      "content": "Saya sering maag",
      "timestamp": "2025-01-15T10:31:00Z"
    }
  ]
}
```

---

### 2.4 Product & Payment API

#### GET /api/products
**Purpose**: Mendapatkan daftar produk Jates9
**Response**:
```json
{
  "products": [
    {
      "id": "premium",
      "name": "Paket Premium",
      "duration": "30 hari",
      "price": 450000,
      "original_price": 700000,
      "discount": 36
    }
  ]
}
```

#### POST /api/payment/create
**Purpose**: Membuat order dan redirect ke Midtrans (future)
**Request Body**:
```json
{
  "user_id": "user_12345",
  "product_id": "premium",
  "phone_number": "081234567890",
  "name": "John Doe"
}
```

**Response**:
```json
{
  "success": true,
  "order_id": "order_xyz789",
  "payment_url": "https://app.midtrans.com/snap/v1/...",
  "amount": 450000
}
```

---

### 2.5 WhatsApp Integration API

#### POST /api/whatsapp/send
**Purpose**: Mengirim pesan WhatsApp ke user
**Request Body**:
```json
{
  "phone_number": "081234567890",
  "message": "Selamat pagi! Ini tugas hari ke-5..."
}
```

**Response**:
```json
{
  "success": true,
  "message_id": "wa_msg_123"
}
```

#### POST /api/whatsapp/schedule
**Purpose**: Schedule pesan WhatsApp (untuk daily tasks)
**Request Body**:
```json
{
  "user_id": "user_12345",
  "phone_number": "081234567890",
  "schedule_time": "2025-01-16T08:00:00Z",
  "message": "Tugas pagi Anda: Minum 2 gelas air hangat"
}
```

---

## 3. DATABASE SCHEMA (MongoDB)

### Collection: users
```javascript
{
  _id: ObjectId,
  phone_number: String (unique),
  name: String,
  health_type: String, // A, B, C, ABC
  health_score: Number,
  quiz_date: Date,
  challenge_enrolled: Boolean,
  challenge_start_date: Date,
  created_at: Date,
  updated_at: Date
}
```

### Collection: challenges
```javascript
{
  _id: ObjectId,
  user_id: String (ref users),
  current_day: Number,
  start_date: Date,
  completed_tasks: Array<{
    day: Number,
    time: String, // morning, noon, evening
    task: String,
    completed_at: Date
  }>,
  streak_days: Number,
  status: String, // active, completed, paused
  created_at: Date,
  updated_at: Date
}
```

### Collection: chat_sessions
```javascript
{
  _id: ObjectId,
  user_id: String (ref users),
  session_id: String,
  messages: Array<{
    role: String, // user, assistant
    content: String,
    timestamp: Date
  }>,
  created_at: Date,
  updated_at: Date
}
```

### Collection: orders
```javascript
{
  _id: ObjectId,
  user_id: String (ref users),
  product_id: String,
  amount: Number,
  status: String, // pending, paid, cancelled
  payment_url: String,
  midtrans_order_id: String,
  created_at: Date,
  updated_at: Date
}
```

---

## 4. FRONTEND INTEGRATION CHANGES

### Changes Required in Pages:

#### HealthQuiz.jsx
- Replace `localStorage.setItem('quizResult', ...)` with `POST /api/quiz/submit`
- After submission, navigate to `/challenge` with user_id

#### Challenge.jsx
- Replace `localStorage.setItem('challengeEnrolled', ...)` with `POST /api/challenge/enroll`
- Fetch challenge progress with `GET /api/challenge/progress/{user_id}`
- Add check-in functionality with `POST /api/challenge/checkin`

#### AIChat.jsx
- Replace mock response with `POST /api/chat/message`
- Load chat history on mount with `GET /api/chat/history/{user_id}`
- Add session management

#### ProductPage.jsx
- Replace mock purchase with `POST /api/payment/create`
- Redirect to Midtrans payment URL (future)

---

## 5. ENVIRONMENT VARIABLES

### Backend (.env)
```
MONGO_URL=mongodb://localhost:27017/jates9
DB_NAME=jates9
EMERGENT_LLM_KEY=sk-emergent-2FdD6F844938b4aC19
WHATSAPP_API_KEY=Hyw8OdnzTHwbi88t
WHATSAPP_SERVICE_URL=http://localhost:3001
MIDTRANS_SERVER_KEY=<will_be_added_later>
```

### Frontend (.env)
```
REACT_APP_BACKEND_URL=<existing_value>
```

---

## 6. PRIORITY IMPLEMENTATION ORDER

### Phase 1: Core Features (Current Sprint)
1. ✅ Quiz API (submit & get result)
2. ✅ Basic User Management
3. ✅ AI Chat Integration (OpenAI via Emergent LLM)
4. ✅ Challenge Enrollment API

### Phase 2: Advanced Features
1. Challenge Progress Tracking
2. Daily Check-in System
3. WhatsApp Integration (automated messages)

### Phase 3: E-commerce
1. Product Management
2. Midtrans Payment Integration
3. Order Management

---

## 7. TESTING STRATEGY

### Unit Testing
- Test each API endpoint individually
- Mock database operations
- Test error handling

### Integration Testing
- Test full user flow: Quiz → Challenge → Product Purchase
- Test WhatsApp integration
- Test AI chat responses

### Frontend Integration Testing
- Test all page navigations
- Test form submissions
- Test error states

---

## NOTES
- Mock data akan tetap digunakan untuk product info dan challenge days (static content)
- WhatsApp integration akan menggunakan credential: `Hyw8OdnzTHwbi88t`
- AI Chat akan menggunakan Emergent LLM key untuk OpenAI GPT-5.1
- Payment gateway (Midtrans) akan di-mock dulu sampai user provide credentials
