# Installation Guide for Toast and Validation Features

## Required Dependencies

To use the new toast notifications and Yup validation features, you need to install the following dependencies:

### Install Dependencies

Run this command in your project directory:

```bash
npm install react-hot-toast yup
```

Or if you're using yarn:

```bash
yarn add react-hot-toast yup
```

### What's Been Added

1. **Toast Notifications** (`react-hot-toast`)
   - Success messages for form validation
   - Error messages for validation failures
   - Loading indicators during API calls
   - Success confirmation for API responses

2. **Yup Validation** (`yup`)
   - Comprehensive form validation schemas
   - Real-time validation feedback
   - Better error messages
   - Type-safe validation

### Features Implemented

#### Toast Notifications:
- ✅ Form validation success
- ✅ API call loading states
- ✅ API success responses
- ✅ API error handling
- ✅ Test data fill confirmation

#### Yup Validation:
- ✅ Organization data validation
- ✅ Super admin data validation
- ✅ Email format validation
- ✅ Phone number validation (10 digits)
- ✅ Password confirmation matching
- ✅ Required field validation
- ✅ Minimum length validation

### Usage

After installing the dependencies, the setup page will automatically:

1. Show toast notifications for all user actions
2. Validate forms using Yup schemas
3. Display better error messages
4. Provide loading feedback during API calls

### API Integration

The setup page now calls your backend API with proper validation and shows:
- Loading toast during API call
- Success toast on successful setup
- Error toast on API failures
- Detailed error messages

### Testing

1. Click "Fill with test data" to auto-populate the form
2. Try submitting with invalid data to see validation errors
3. Submit with valid data to see the API integration in action

The toast notifications will appear in the top-right corner of the screen.
