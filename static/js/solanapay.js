import { encodeURL, createQR, findReference, validateTransfer } from '@solana/pay';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';

function drawQRCode() {
    // Define the recipient and amount
    const recipient = new PublicKey('RecipientPublicKeyHere');
    const amount = 1; // Amount in SOL

    // Create a payment request link
    const paymentRequest = encodeURL({
        recipient,
        amount,
        label: 'Payment for services',
        message: 'Thank you for your business!'
    });

    // Display the payment request link
    console.log('Payment request link:', paymentRequest);

    // Optionally, create a QR code for the payment request
    const qrCode = createQR(paymentRequest);
    document.getElementById('qr-code').appendChild(qrCode);

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = qrCode.getModuleCount() * 10;
    canvas.height = qrCode.getModuleCount() * 10;
    for (let row = 0; row < qrCode.getModuleCount(); row++) {
        for (let col = 0; col < qrCode.getModuleCount(); col++) {
            context.fillStyle = qrCode.isDark(row, col) ? '#000000' : '#ffffff';
            context.fillRect(col * 10, row * 10, 10, 10);
        }
    }
    document.getElementById('qr-code').appendChild(canvas);
}

drawQRCode();