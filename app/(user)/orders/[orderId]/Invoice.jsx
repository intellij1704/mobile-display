import React from 'react';
import { getStorage } from "firebase-admin/storage";
import { admin, adminDB } from '@/lib/firebase_admin';
import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

const Invoice = ({ order, orderId, addressData, products, companyDetails, title, invoiceId, type = 'order' }) => {
    const getOrderDate = (timestamp) => {
        if (!timestamp) return 'N/A';
        // Firestore Timestamps have a toDate() method, client-side dates do not when serialized.
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };
    const orderDate = getOrderDate(order?.timestampCreate);

    const subtotal = order?.checkout?.subtotal || 0;
    const discount = order?.checkout?.discount || 0;
    const shippingCharge = order?.checkout?.shippingCharge || 0;
    const airExpressFee = order?.checkout?.airExpressFee || 0;
    const returnFees = order?.checkout?.returnFees || 0;
    const replacementFees = order?.checkout?.replacementFees || 0;
    const total = order?.checkout?.total || 0;
    const advance = order?.checkout?.advance || 0;
    const codAmount = order?.checkout?.codAmount || 0;
    const paymentMode = order?.paymentMode === 'cod' ? 'Cash on Delivery (COD)' : 'Prepaid';

    return (
        <div id="invoice-content" style={{ width: '210mm', minHeight: '297mm', fontFamily: 'Arial, sans-serif', color: '#333', backgroundColor: '#fff', padding: '20px', boxSizing: 'border-box' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #eee', paddingBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                    <img src={companyDetails.logoUrl} alt="Company Logo" style={{ width: '150px', height: 'auto' }} />
                    <p style={{ margin: '5px 0 0', fontSize: '12px' }}>{companyDetails.address}</p>
                    <p style={{ margin: '5px 0 0', fontSize: '12px' }}>Email: {companyDetails.email} | Phone: {companyDetails.phone}</p>
                </div>
                <div style={{ flex: 1, textAlign: 'right' }}>
                    <h1 style={{ margin: '0', color: '#000', fontSize: '28px', fontWeight: 'bold' }}>{title || 'Invoice'}</h1>
                    {invoiceId && <p style={{ margin: '5px 0 0', fontSize: '14px' }}><strong>Invoice No:</strong> #{invoiceId}</p>}
                    <p style={{ margin: '5px 0 0', fontSize: '14px' }}><strong>Order ID:</strong> #{orderId}</p>
                    <p style={{ margin: '5px 0 0', fontSize: '14px' }}><strong>Date:</strong> {orderDate}</p>
                </div>
            </div>

            {/* Billing Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
                <div>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px' }}>Bill To:</h2>
                    <p style={{ margin: '0', fontSize: '14px' }}><strong>{addressData.fullName}</strong></p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>{addressData.addressLine1}</p>
                    {addressData.landmark && <p style={{ margin: '5px 0', fontSize: '14px' }}>{addressData.landmark}</p>}
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>{addressData.city}, {addressData.state} - {addressData.pincode}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>{addressData.mobile}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}>{addressData.email}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', margin: '0 0 10px' }}>Payment Method:</h2>
                    <p style={{ margin: '0', fontSize: '14px' }}>{paymentMode}</p>
                </div>
            </div>

            {/* Items Table */}
            <div style={{ marginTop: '40px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f2f2f2', color: '#333' }}>
                            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #ddd', fontSize: '14px' }}>Product</th>
                            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px' }}>Qty</th>
                            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px' }}>Unit Price</th>
                            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px' }}>Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map((item, index) => (
                            <tr key={index}>
                                <td style={{ padding: '12px', borderBottom: '1px solid #ddd', fontSize: '14px' }}>
                                    {item.title}
                                    {item.selectedColor && ` - ${item.selectedColor}`}
                                    {item.selectedQuality && ` - ${item.selectedQuality}`}
                                </td>
                                <td style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #ddd', fontSize: '14px' }}>{item.quantity}</td>
                                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px' }}>₹{item.price.toFixed(2)}</td>
                                <td style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #ddd', fontSize: '14px' }}>₹{item.total.toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Totals Section */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <div style={{ width: '300px' }}>
                    <table style={{ width: '100%', fontSize: '14px' }}>
                        <tbody>
                            <tr>
                                <td style={{ padding: '8px', textAlign: 'left' }}>Subtotal</td>
                                <td style={{ padding: '8px', textAlign: 'right' }}>₹{subtotal.toFixed(2)}</td>
                            </tr>
                            {discount > 0 && (
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'left', color: 'green' }}>Discount</td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: 'green' }}>-₹{discount.toFixed(2)}</td>
                                </tr>
                            )}
                            {shippingCharge > 0 && (
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'left' }}>Shipping</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{shippingCharge.toFixed(2)}</td>
                                </tr>
                            )}
                            {airExpressFee > 0 && (
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'left' }}>Express Delivery</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{airExpressFee.toFixed(2)}</td>
                                </tr>
                            )}
                            {returnFees > 0 && (
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'left' }}>Return Fees</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{returnFees.toFixed(2)}</td>
                                </tr>
                            )}
                            {replacementFees > 0 && (
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'left' }}>Replacement Fees</td>
                                    <td style={{ padding: '8px', textAlign: 'right' }}>₹{replacementFees.toFixed(2)}</td>
                                </tr>
                            )}
                            <tr style={{ borderTop: '2px solid #333' }}>
                                <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold', fontSize: '16px' }}>Total</td>
                                <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: '16px' }}>₹{total.toFixed(2)}</td>
                            </tr>
                            {type !== 'delivered' && paymentMode === 'Cash on Delivery (COD)' && (
                                <>
                                    <tr>
                                        <td style={{ padding: '8px', textAlign: 'left', color: 'green' }}>Advance Paid</td>
                                        <td style={{ padding: '8px', textAlign: 'right', color: 'green' }}>-₹{advance.toFixed(2)}</td>
                                    </tr>
                                    <tr style={{ backgroundColor: '#ffc', borderTop: '1px solid #eea' }}>
                                        <td style={{ padding: '10px 8px', textAlign: 'left', fontWeight: 'bold' }}>Amount to Pay on Delivery</td>
                                        <td style={{ padding: '10px 8px', textAlign: 'right', fontWeight: 'bold' }}>₹{codAmount.toFixed(2)}</td>
                                    </tr>
                                </>
                            )}
                            {(type === 'delivered' || paymentMode !== 'Cash on Delivery (COD)') && (
                                <tr>
                                    <td style={{ padding: '8px', textAlign: 'left', color: 'green' }}>Amount Paid</td>
                                    <td style={{ padding: '8px', textAlign: 'right', color: 'green' }}>₹{total.toFixed(2)}</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Footer */}
            <div style={{ marginTop: '50px', paddingTop: '20px', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '12px', color: '#777' }}>
                <p>Thank you for your purchase!</p>
                <p>If you have any questions, please contact us at {companyDetails.email} or {companyDetails.phone}.</p>
                <p style={{ marginTop: '10px' }}>This is a computer-generated invoice and does not require a signature.</p>
            </div>
        </div>
    );
};

export default Invoice;

export const getInvoiceAsBuffer = async (orderData, { title, invoiceId, type = 'order' } = {}) => {
    const ReactDOMServer = (await import('react-dom/server')).default;

    const addressData = JSON.parse(orderData.checkout.metadata.address || '{}');
    const companyDetails = {
        logoUrl: `https://www.mobiledisplay.in/logo.png`,
        address: 'Anurupapally, Krishnapur, Kestopur, Noth 24 Parganas, West Bengal 700101',
        email: 'info@mobiledisplay.in',
        phone: '+91-1234567890',
    };

    // Re-serialize and de-serialize to convert plain JS date strings to Firestore Timestamps if needed
    const sanitizedOrderData = JSON.parse(
        JSON.stringify(orderData, (key, value) => {
            // ✅ Handle Firestore Timestamp objects
            if (value && typeof value === 'object' && typeof value.seconds === 'number') {
                return new Date(value.seconds * 1000).toISOString();
            }

            // ✅ Handle Date objects
            if (value instanceof Date) {
                return value.toISOString();
            }

            // ✅ Keep already valid ISO strings as-is
            if (
                typeof value === 'string' &&
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)
            ) {
                return value;
            }

            return value;
        })
    );



    const invoiceHTML = ReactDOMServer.renderToString(
        <Invoice
            order={sanitizedOrderData}
            orderId={sanitizedOrderData.id}
            addressData={addressData}
            products={sanitizedOrderData.products}
            companyDetails={companyDetails}
            title={title || 'Order Invoice'}
            type={type}
            invoiceId={invoiceId}
        />
    );

    const browser = await puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath(),
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });
    const page = await browser.newPage();

    // Set the content of the page
    await page.setContent(invoiceHTML, { waitUntil: 'networkidle0' });

    // Generate PDF
    const buffer = await page.pdf({
        format: 'A4',
        printBackground: true
    });

    await browser.close();

    // Upload to Firebase Storage
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        console.error("❌ FIREBASE_STORAGE_BUCKET environment variable not set.");
        throw new Error("Storage service is not configured correctly on the server.");
    }
    const bucket = getStorage(adminDB.app).bucket(bucketName);
    const filePath = `invoices/${orderData.id}/${type}_invoice_${orderData.id}${invoiceId ? '_' + invoiceId : ''}.pdf`;
    const file = bucket.file(filePath);

    await file.save(buffer, {
        metadata: { contentType: 'application/pdf' },
    });

    const [downloadURL] = await file.getSignedUrl({ action: 'read', expires: '03-09-2491' });
    return { pdfBuffer: buffer, downloadURL };
};