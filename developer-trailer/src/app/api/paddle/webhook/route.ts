import { NextRequest, NextResponse } from 'next/server'
import { paddleConfig } from '@/lib/paddle/config'
import { headers } from 'next/headers'
import { createHmac, timingSafeEqual } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const headersList = await headers() // Add await here
    const signature = headersList.get('paddle-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature manually (recommended approach for Next.js)
    const isValid = verifyWebhookSignature(body, signature, paddleConfig.webhookSecret)

    if (!isValid) {
      console.error('Webhook verification failed')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Handle different webhook events
    switch (event.event_type) {
      case 'subscription.created':
        console.log('Subscription created:', event.data)
        // Handle subscription creation
        await handleSubscriptionCreated(event.data)
        break
      
      case 'subscription.updated':
        console.log('Subscription updated:', event.data)
        // Handle subscription updates
        await handleSubscriptionUpdated(event.data)
        break
      
      case 'subscription.canceled':
        console.log('Subscription canceled:', event.data)
        // Handle subscription cancellation
        await handleSubscriptionCanceled(event.data)
        break
      
      case 'transaction.completed':
        console.log('Transaction completed:', event.data)
        // Handle successful payment
        await handleTransactionCompleted(event.data)
        break
      
      default:
        console.log('Unhandled event type:', event.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

// Manual webhook signature verification function
function verifyWebhookSignature(body: string, signature: string, secret: string): boolean {
  try {
    // Parse the signature header
    const parts = signature.split(';')
    let timestamp = ''
    let signatures: string[] = []

    for (const part of parts) {
      const [key, value] = part.split('=')
      if (key === 'ts') {
        timestamp = value
      } else if (key === 'h1') {
        signatures.push(value)
      }
    }

    if (!timestamp || signatures.length === 0) {
      return false
    }

    // Create the signed payload
    const signedPayload = timestamp + ':' + body

    // Generate expected signature
    const expectedSignature = createHmac('sha256', secret)
      .update(signedPayload, 'utf8')
      .digest('hex')

    // Compare signatures using timing-safe comparison
    return signatures.some(sig => {
      try {
        return timingSafeEqual(
          Buffer.from(sig, 'hex'),
          Buffer.from(expectedSignature, 'hex')
        )
      } catch {
        return false
      }
    })
  } catch (error) {
    console.error('Signature verification error:', error)
    return false
  }
}

// Event handler functions
async function handleSubscriptionCreated(data: any) {
  // Implement your subscription creation logic here
  console.log('Processing subscription creation:', data.id)
}

async function handleSubscriptionUpdated(data: any) {
  // Implement your subscription update logic here
  console.log('Processing subscription update:', data.id)
}

async function handleSubscriptionCanceled(data: any) {
  // Implement your subscription cancellation logic here
  console.log('Processing subscription cancellation:', data.id)
}

async function handleTransactionCompleted(data: any) {
  // Implement your transaction completion logic here
  console.log('Processing transaction completion:', data.id)
}