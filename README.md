# 🩸 BloodLink TN - Blood Donation Management System

A comprehensive blood donation management platform exclusively for Tamil Nadu, connecting donors and requesters in real-time with smart location-based matching and automatic donor management.

## 🎯 Features

- **User Registration**: Register as Donors or Requesters
- **Interactive Map**: Google Maps integration showing all available donors with location markers
- **Smart Search**: Search donors by blood group and district
- **Auto-Cleanup**: Donors automatically removed after 14 days
- **SMS Notifications**: Twilio integration for urgent blood requests
- **Tamil Nadu Coverage**: All 38 districts with pre-loaded hospital data
- **Dashboard**: Real-time statistics and quick actions

## 🏗️ Project Structure

```
bloodlink-tn/
├── backend/
│   ├── app.py                 # Flask application entry point
│   ├── config.py             # Configuration settings
│   ├── models.py             # Database models (User, Donor, Request, Hospital)
│   ├── requirements.txt      # Python dependencies
│   ├── .env                  # Environment variables
│   ├── routes/               # API route handlers
│   │   ├── auth_routes.py
│   │   ├── donor_routes.py
│   │   ├── request_routes.py
│   │   ├── notify_routes.py
│   │   └── hospital_routes.py
│   └── data/
│       └── hospitals.json    # Tamil Nadu hospitals data
├── frontend/
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── api/             # API integration
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- MySQL 5.7+ or MariaDB
- Google Maps API Key (for map functionality)
- Twilio Account (optional, for SMS notifications)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Create virtual environment** (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure MySQL Database**:
   - Create a new MySQL database named `bloodlink_tn`
   - Update `.env` file with your MySQL credentials:
     ```
     MYSQL_HOST=localhost
     MYSQL_PORT=3306
     MYSQL_USER=root
     MYSQL_PASSWORD=Amrish@2002
     MYSQL_DATABASE=bloodlink_tn
     FLASK_ENV=development
     SECRET_KEY=mysecretkey
     ```

5. **Configure Twilio** (optional):
   - Get your Twilio Account SID, Auth Token, and Phone Number
   - Add them to `.env`:
     ```
     TWILIO_ACCOUNT_SID=your_account_sid
     TWILIO_AUTH_TOKEN=your_auth_token
     TWILIO_PHONE_NUMBER=+1234567890
     ```

6. **Initialize Database**:
   ```bash
   flask db init
   flask db migrate -m "Initial migration"
   flask db upgrade
   ```

7. **Run Flask Server**:
   ```bash
   flask run
   ```
   The backend will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node dependencies**:
   ```bash
   npm install
   ```

3. **Configure Google Maps API**:
   - Get a Google Maps JavaScript API key from [Google Cloud Console](https://console.cloud.google.com/)
   - Create a `.env` file in the frontend directory:
     ```
     REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
     ```

4. **Start React Development Server**:
   ```bash
   npm start
   ```
   The frontend will run on `http://localhost:3000`

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Donors
- `POST /api/donors/register` - Register/update donor profile
- `GET /api/donors/all` - Get all donors (with filters)
- `GET /api/donors/map` - Get donors for map display
- `GET /api/donors/my-profile` - Get current user's donor profile
- `POST /api/donors/deactivate` - Deactivate donor profile

### Requests
- `POST /api/requests/create` - Create blood request
- `GET /api/requests/all` - Get all requests
- `GET /api/requests/my-requests` - Get user's requests
- `POST /api/requests/<id>/fulfill` - Mark request as fulfilled
- `GET /api/requests/<id>/match-donors` - Get matching donors for request

### Hospitals
- `GET /api/hospitals/districts` - Get all Tamil Nadu districts
- `GET /api/hospitals/<district>` - Get hospitals for district
- `GET /api/hospitals/all` - Get all hospitals

### Notifications
- `POST /api/notify/request-donors` - Notify donors for a request
- `POST /api/notify/contact-donor` - Contact specific donor

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics

## 🗄️ Database Models

### User
- Authentication and user profile information
- Types: 'donor' or 'requester'

### Donor
- Donor registration details
- Location (latitude, longitude)
- Auto-removal date (14 days from registration)
- Available status

### Request
- Blood request details
- Status: pending, fulfilled, cancelled
- Urgency level: normal, urgent, critical

### Hospital
- Hospital information by district
- Pre-loaded from JSON data

## ⚙️ Key Features Explained

### Automatic Donor Removal
- Donors are automatically marked as unavailable after 14 days
- Background scheduler runs every 12 hours to check and update expired donors
- Donors can re-register anytime

### Google Maps Integration
- Shows all available donors on an interactive map
- Filter by blood group and district
- Click markers to see donor details and contact information

### SMS Notifications
- When a requester creates a request, matching donors receive SMS alerts
- Uses Twilio API for SMS delivery
- Falls back to mock mode if Twilio is not configured

### Tamil Nadu Districts
- All 38 districts supported
- Hospitals pre-loaded for each district
- Dynamic hospital selection based on district

## 🔧 Configuration

### Backend Environment Variables (.env)
```env
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=bloodlink_tn
FLASK_ENV=development
SECRET_KEY=your_secret_key
TWILIO_ACCOUNT_SID=optional
TWILIO_AUTH_TOKEN=optional
TWILIO_PHONE_NUMBER=optional
```

### Frontend Environment Variables (.env)
```env
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## 🧪 Testing

### Manual Testing
1. Register as a donor and add location
2. Register as a requester
3. Create a blood request
4. View donors on the map
5. Contact donors via phone

### API Testing
Use Postman or curl to test API endpoints:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@test.com","password":"test123","user_type":"donor","phone":"1234567890"}'
```

## 🐛 Troubleshooting

### Database Connection Issues
- Verify MySQL is running
- Check `.env` credentials
- Ensure database `bloodlink_tn` exists

### Google Maps Not Loading
- Verify API key is set in frontend `.env`
- Check browser console for errors
- Ensure Maps JavaScript API is enabled in Google Cloud Console

### SMS Not Sending
- SMS requires Twilio configuration
- Without Twilio, notifications will log to console (mock mode)
- Check Twilio credentials in backend `.env`

## 📝 License

This project is created for educational and social good purposes.

## 👥 Contributing

Contributions are welcome! Please ensure:
- Code follows existing style
- Tests pass
- Documentation updated

## 🎯 Future Enhancements

- [ ] Email notifications
- [ ] Push notifications
- [ ] Donor verification system
- [ ] Admin dashboard
- [ ] Mobile app
- [ ] Analytics and reporting

---

**Built with ❤️ for Tamil Nadu**

