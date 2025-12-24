# WhatsApp Chat Button Setup

## Current Configuration

The WhatsApp button is configured in `src/App.jsx` around line 550.

## How to Update Your WhatsApp Number

1. **Open `src/App.jsx`**
2. **Find the WhatsApp button** (search for "whatsapp-button")
3. **Update the phone number** in the `href` attribute:

```jsx
href="https://wa.me/YOUR_PHONE_NUMBER?text=Hello%2C%20I%27d%20like%20to%20inquire%20about%20your%20services"
```

### Phone Number Format

- **Remove all spaces, dashes, and special characters**
- **Include country code** (e.g., for South Africa: 27)
- **Remove leading zero** from local numbers

**Examples:**
- South Africa: `27123456789` (if local number is 012 345 6789)
- International: `1234567890` (for US number 123-456-7890)

### Customize the Message

You can customize the pre-filled message by changing the `text` parameter:

```jsx
href="https://wa.me/27123456789?text=Your%20custom%20message%20here"
```

**Note:** Use `%20` for spaces and `%27` for apostrophes in URLs.

## Features

✅ Floating button in bottom right corner  
✅ WhatsApp green color (#25d366)  
✅ Hover tooltip "Chat with us"  
✅ Smooth animations  
✅ Mobile responsive  
✅ Opens WhatsApp Web or App  

## Testing

1. Click the green WhatsApp button
2. It should open WhatsApp with your number and pre-filled message
3. Test on both desktop and mobile devices

## Styling

The button styling is in `src/styles.css` (search for `.whatsapp-button`). You can customize:
- Size (currently 60px)
- Position (bottom/right)
- Colors
- Shadow effects






