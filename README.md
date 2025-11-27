# WhatsApp Mesaj Görüntüleyici

Modern ve güvenli WhatsApp mesaj görüntüleme uygulaması.

## 🚀 Özellikler

- ✅ WhatsApp benzeri modern arayüz
- ✅ Gerçek zamanlı mesaj görüntüleme
- ✅ Kullanıcı arama ve filtreleme
- ✅ Detaylı istatistikler
- ✅ Responsive tasarım
- ✅ Güvenli MySQL bağlantısı
- ✅ Docker desteği

## 📋 Gereksinimler

- Node.js 18+
- MySQL 5.7+
- Docker (opsiyonel)

## 🛠️ Kurulum

### 1. Repository'yi klonlayın

```bash
git clone <your-repo-url>
cd whatsapp-viewer
```

### 2. Environment variables ayarlayın

`.env` dosyası oluşturun:

```bash
cp .env.example .env
```

`.env` dosyasını düzenleyin ve veritabanı bilgilerinizi girin.

### 3. Docker ile çalıştırma (Önerilen)

```bash
docker-compose up -d
```

Uygulama `http://localhost:3000` adresinde çalışacaktır.

### 4. Manuel kurulum

**Backend:**

```bash
cd backend
npm install
npm start
```

**Frontend (ayrı terminalde):**

```bash
cd frontend
npm install
npm start
```

## 📊 Veritabanı Yapısı

```sql
CREATE TABLE messages (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id VARCHAR(30) NOT NULL,
  direction ENUM('in', 'out') NOT NULL,
  wa_message_id VARCHAR(120),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

## 🔒 Güvenlik

- ✅ SQL Injection koruması (Prepared Statements)
- ✅ CORS yapılandırması
- ✅ Environment variables ile hassas bilgi koruması
- ✅ Connection pooling
- ✅ Health check endpoint

## 🌐 API Endpoints

- `GET /api/users` - Tüm kullanıcıları listele
- `GET /api/messages/:userId` - Kullanıcının mesajlarını getir
- `GET /api/search?q=query` - Mesajlarda ara
- `GET /api/stats` - Genel istatistikler
- `GET /api/stats/weekly` - Haftalık istatistikler
- `GET /api/health` - Health check

## 📱 Ekran Görüntüleri

- Modern WhatsApp benzeri arayüz
- Detaylı istatistik paneli
- Responsive mobil uyumlu tasarım

## 🤝 Katkıda Bulunma

Pull request'ler kabul edilir. Büyük değişiklikler için lütfen önce issue açın.

## 📄 Lisans

MIT

## 👨‍💻 Geliştirici

Sorularınız için issue açabilirsiniz.
