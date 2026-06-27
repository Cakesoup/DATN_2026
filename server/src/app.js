const express = require('express');
const cors = require('cors');

const authRoutes = require('./modules/auth/auth.routes');

const customerVehicleRoutes = require('./modules/customer/vehicles/vehicle.routes');
const customerBookingRoutes = require('./modules/customer/bookings/booking.routes');
const customerPricingRoutes = require('./modules/customer/pricing/pricing.routes');
const customerInvoiceRoutes = require('./modules/customer/invoices/invoice.routes');
const customerProfileRoutes = require('./modules/customer/profile/profile.routes');
const customerReviewRoutes = require('./modules/customer/reviews/review.routes');
const customerSupportRoutes = require('./modules/customer/support/support.routes');

const staffVehicleRoutes = require('./modules/staff/vehicles/vehicle-staff.routes');
const staffBookingRoutes = require('./modules/staff/bookings/booking-staff.routes');
const staffInvoiceRoutes = require('./modules/staff/invoices/invoice-staff.routes');
const staffProfileRoutes = require('./modules/staff/profile/profile-staff.routes');
const staffSupportRoutes = require('./modules/staff/support/support-staff.routes');

const adminVehicleRoutes = require('./modules/admin/vehicles/vehicle-admin.routes');
const adminBookingRoutes = require('./modules/admin/bookings/booking-admin.routes');
const adminPricingRoutes = require('./modules/admin/pricing/pricing-admin.routes');
const adminUserRoutes = require('./modules/admin/users/user-admin.routes');
const adminReportRoutes = require('./modules/admin/reports/report-admin.routes');
const adminProfileRoutes = require('./modules/admin/profile/profile-admin.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);

app.use('/api/customer/vehicles', customerVehicleRoutes);
app.use('/api/customer/bookings', customerBookingRoutes);
app.use('/api/customer/pricing', customerPricingRoutes);
app.use('/api/customer/invoices', customerInvoiceRoutes);
app.use('/api/customer/profile', customerProfileRoutes);
app.use('/api/customer/reviews', customerReviewRoutes);
app.use('/api/customer/support', customerSupportRoutes);

app.use('/api/staff/vehicles', staffVehicleRoutes);
app.use('/api/staff/bookings', staffBookingRoutes);
app.use('/api/staff/invoices', staffInvoiceRoutes);
app.use('/api/staff/profile', staffProfileRoutes);
app.use('/api/staff/support', staffSupportRoutes);

app.use('/api/admin/vehicles', adminVehicleRoutes);
app.use('/api/admin/bookings', adminBookingRoutes);
app.use('/api/admin/pricing', adminPricingRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/reports', adminReportRoutes);
app.use('/api/admin/profile', adminProfileRoutes);

app.use((req, res) => {
    return res.status(404).json({
        success: false,
        message: 'Route không tồn tại'
    });
});

app.use((err, req, res, next) => {
    console.error('Global error:', err);

    return res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Lỗi server'
    });
});

module.exports = app;