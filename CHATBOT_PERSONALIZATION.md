# 🎯 Tính Năng Chatbot Cá Nhân Hóa

## 📋 Tổng Quan

Chatbot của DermaScan giờ đây có khả năng **cá nhân hóa câu trả lời** dựa trên kết quả phân tích da gần nhất của người dùng. Điều này giúp tư vấn chính xác và phù hợp hơn với tình trạng da thực tế của từng người.

---

## ✨ Tính Năng Mới

### 🔍 Chatbot Hiểu Tình Trạng Da Của Bạn

Khi người dùng đã có phân tích da được lưu, chatbot sẽ:

- 📊 Biết loại da của bạn (Dầu, Khô, Hỗn hợp, Nhạy cảm)
- 🔴 Nhận biết các vấn đề da hiện tại (Mụn, Nám, Thâm, v.v.)
- ⚠️ Đánh giá mức độ nghiêm trọng (Low, Medium, High)
- 📅 Biết thời điểm phân tích gần nhất

### 💬 Ví Dụ Câu Trả Lời Có Cá Nhân Hóa

**Trước (không cá nhân hóa):**

```
Người dùng: "Tôi nên dùng kem dưỡng nào?"

Chatbot: "Bạn nên chọn kem dưỡng phù hợp với loại da của bạn.
Da dầu nên dùng loại oil-free, da khô nên dùng loại giữ ẩm..."
```

**Sau (có cá nhân hóa):**

```
Người dùng: "Tôi nên dùng kem dưỡng nào?"

Chatbot: "Dựa trên phân tích da của bạn (loại da dầu, có mụn trứng cá
mức độ trung bình), tôi khuyên bạn nên chọn kem dưỡng không chứa dầu
(oil-free) với các thành phần như:
- Niacinamide: giảm dầu và se khít lỗ chân lông
- Hyaluronic Acid: cấp ẩm không gây bít tắc
- Salicylic Acid: ngăn ngừa mụn mới

Tránh các kem quá dày hoặc chứa dầu khoáng vì sẽ gây bít tắc lỗ chân lông
và làm tình trạng mụn trầm trọng hơn."
```

---

## 🛠️ Cách Hoạt Động

### Backend Architecture

```
User Question
    ↓
🔐 [Authenticate] → Get userId
    ↓
📊 [Fetch Latest Analysis] ← Firestore
    ↓
📝 [Build Context]
    - skinType: "Da dầu"
    - conditions: ["Mụn trứng cá", "Lỗ chân lông to"]
    - riskLevels: ["Medium", "Low"]
    - analyzedAt: "21/12/2025"
    ↓
🤖 [Gemini AI] + Knowledge Base + User Context
    ↓
💬 Personalized Answer
```

### Các Endpoint Liên Quan

#### 1. **GET /api/v1/analysis/latest** (Mới)

Lấy phân tích da gần nhất của user

**Request:**

```bash
GET /api/v1/analysis/latest
Authorization: Bearer <FIREBASE_TOKEN>
```

**Response:**

```json
{
  "success": true,
  "data": {
    "analysis": {
      "id": "abc123",
      "userId": "user_xyz",
      "result": {
        "skinType": "Da dầu",
        "zones": [
          {
            "name": "Vùng trán",
            "condition": "Mụn trứng cá",
            "riskLevel": "Medium",
            "description": "..."
          }
        ]
      },
      "savedAt": "2025-12-21T10:30:00Z"
    }
  }
}
```

#### 2. **POST /api/v1/chatbot/question** (Đã cập nhật)

Trả lời câu hỏi với RAG + cá nhân hóa

**Request:**

```json
{
  "question": "Tôi nên dùng sữa rửa mặt nào?"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "questionId": "req_123",
    "question": "Tôi nên dùng sữa rửa mặt nào?",
    "answer": "Với loại da dầu và tình trạng mụn của bạn...",
    "sources": [...]
  }
}
```

#### 3. **POST /api/v1/chatbot/chat** (Đã cập nhật)

Chat đa lượt với cá nhân hóa

**Request:**

```json
{
  "history": [...],
  "text": "Tại sao da tôi bị mụn nhiều vậy?",
  "image": null
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "chatId": "req_456",
    "response": {
      "role": "model",
      "text": "Dựa trên phân tích da của bạn...",
      "sources": [...]
    }
  }
}
```

---

## 🔧 Implementation Details

### Backend Files Modified

1. **`backend/src/controllers/analysis.controller.ts`**

   - ✅ Thêm `getLatestAnalysis()` controller

2. **`backend/src/routes/analysis.routes.ts`**

   - ✅ Thêm route `GET /latest`

3. **`backend/src/services/gemini/rag.service.ts`**

   - ✅ Thêm interface `UserAnalysisContext`
   - ✅ Cập nhật `getGroundedAnswer()` nhận `userContext`
   - ✅ Cập nhật `getChatbotResponse()` nhận `userContext`

4. **`backend/src/services/gemini/prompts/rag.prompts.ts`**

   - ✅ Cập nhật `RAG_ANSWER_PROMPT()` để include user context
   - ✅ Cập nhật `CHATBOT_PROMPT()` để include user context

5. **`backend/src/controllers/chatbot.controller.ts`**
   - ✅ Thêm helper `getUserAnalysisContext()`
   - ✅ Cập nhật `answerQuestion()` để fetch và pass user context
   - ✅ Cập nhật `chat()` để fetch và pass user context

---

## 📊 Data Flow

### UserAnalysisContext Interface

```typescript
export interface UserAnalysisContext {
  skinType?: string; // "Da dầu", "Da khô", etc.
  conditions?: string[]; // ["Mụn trứng cá", "Nám da"]
  riskLevels?: string[]; // ["High", "Medium"]
  analyzedAt?: string; // "21/12/2025"
}
```

### Prompt Enhancement

**Trước:**

```
[BỐI CẢNH TRI THỨC Y KHOA]:
...nguồn y khoa...

[CÂU HỎI]:
"Tôi nên dùng kem dưỡng nào?"
```

**Sau:**

```
[BỐI CẢNH TRI THỨC Y KHOA]:
...nguồn y khoa...

[THÔNG TIN DA CỦA NGƯỜI DÙNG]:
- Loại da: Da dầu
- Các vấn đề: Mụn trứng cá, Lỗ chân lông to
- Mức độ: Medium, Low
- Phân tích lúc: 21/12/2025

💡 Hãy tham khảo thông tin trên để đưa ra lời khuyên phù hợp
với tình trạng da cụ thể của người dùng.

[CÂU HỎI]:
"Tôi nên dùng kem dưỡng nào?"
```

---

## 🎯 Use Cases

### 1. Guest User (Chưa đăng nhập)

- ❌ Không có user context
- 📝 Chatbot trả lời dựa trên knowledge base (như cũ)
- 💡 Khuyến khích đăng nhập để nhận tư vấn cá nhân hóa

### 2. Logged In User (Chưa phân tích da)

- ❌ Không có user context
- 📝 Chatbot trả lời dựa trên knowledge base
- 💡 Khuyến khích phân tích da để nhận tư vấn chính xác hơn

### 3. Logged In User (Đã phân tích da)

- ✅ Có user context đầy đủ
- 🎯 Chatbot trả lời cá nhân hóa
- 💬 Câu trả lời phù hợp với tình trạng da cụ thể

---

## 🔒 Security & Privacy

### Data Access

- ✅ Chỉ user đã đăng nhập mới được personalize
- ✅ Chỉ fetch analysis của chính user đó (verify userId)
- ✅ Không lưu trữ thông tin phân tích trong cache

### Error Handling

```typescript
// Nếu không fetch được user context
// → Chatbot vẫn hoạt động bình thường (fallback)
const userContext = await getUserAnalysisContext(userId);
// userContext = undefined → Chatbot không personalize
```

---

## 🚀 Testing

### Test Case 1: Guest User

```bash
# Không có Authorization header
POST /api/v1/chatbot/question
{
  "question": "Tôi nên dùng kem chống nắng nào?"
}

# Expected: Câu trả lời chung chung, không cá nhân hóa
```

### Test Case 2: Logged User (Chưa phân tích)

```bash
# Có Authorization header nhưng chưa có analysis
POST /api/v1/chatbot/question
Authorization: Bearer <TOKEN>
{
  "question": "Tôi nên dùng kem chống nắng nào?"
}

# Expected: Câu trả lời chung chung, log: "hasUserContext: false"
```

### Test Case 3: Logged User (Đã phân tích)

```bash
# Có Authorization header và có analysis
POST /api/v1/chatbot/question
Authorization: Bearer <TOKEN>
{
  "question": "Tôi nên dùng kem chống nắng nào?"
}

# Expected: Câu trả lời cá nhân hóa, log: "hasUserContext: true"
# Câu trả lời đề cập đến loại da và vấn đề da cụ thể
```

### Test Case 4: Check Latest Analysis

```bash
GET /api/v1/analysis/latest
Authorization: Bearer <TOKEN>

# Expected:
{
  "success": true,
  "data": {
    "analysis": {
      "id": "...",
      "result": { ... }
    }
  }
}
```

---

## 📈 Benefits

### Cho Người Dùng

- 🎯 **Tư vấn chính xác hơn** - Phù hợp với tình trạng da thực tế
- ⏱️ **Tiết kiệm thời gian** - Không cần mô tả lại loại da mỗi lần hỏi
- 💡 **Lời khuyên cụ thể** - Không còn câu trả lời chung chung

### Cho Hệ Thống

- 🤖 **AI hiểu user hơn** - Context-aware conversation
- 📊 **Tăng retention** - User muốn phân tích da để nhận tư vấn tốt hơn
- ✅ **Better UX** - Seamless personalization

---

## 🎨 Future Enhancements

### 1. Personalization History

```typescript
// Track personalization effectiveness
{
  userId: "user_123",
  personalizedResponses: 42,
  userSatisfactionScore: 4.7
}
```

### 2. Multiple Analysis Tracking

```typescript
// Compare current vs previous analysis
{
  currentAnalysis: { skinType: "Da dầu", ... },
  previousAnalysis: { skinType: "Da hỗn hợp", ... },
  improvement: "Tình trạng mụn đã giảm 30%"
}
```

### 3. Proactive Suggestions

```typescript
// Auto-suggest follow-up actions
{
  lastAnalysis: "2 tuần trước",
  suggestion: "Bạn nên phân tích da lại để kiểm tra tiến triển"
}
```

---

## 📝 Notes

- ✅ **Backwards Compatible**: Guest users và users chưa phân tích vẫn dùng chatbot bình thường
- ✅ **Performance**: Fetch user context song song, không block response
- ✅ **Error Resilient**: Nếu fetch thất bại, chatbot vẫn hoạt động (không personalize)
- ✅ **Privacy**: Chỉ user đã login mới được personalize

---

**Last Updated:** December 23, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
