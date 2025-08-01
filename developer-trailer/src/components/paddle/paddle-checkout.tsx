'use client'

import { useEffect, useState } from 'react'
import { initializePaddle, Paddle } from '@paddle/paddle-js'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface PaddleCheckoutProps {
  priceId: string
  planName: string
  planPrice: string
  billingCycle: 'monthly' | 'yearly'
  userEmail?: string
}

export function PaddleCheckout({ 
  priceId, 
  planName, 
  planPrice, 
  billingCycle,
  userEmail 
}: PaddleCheckoutProps) {
  const [paddle, setPaddle] = useState<Paddle | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
    const environment = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT

    if (!clientToken || !environment) {
      setError('Paddle configuration missing')
      return
    }

    initializePaddle({ 
      environment: environment as 'sandbox' | 'production',
      token: clientToken
    }).then((paddleInstance) => {
      if (paddleInstance) {
        setPaddle(paddleInstance)
      } else {
        setError('Failed to initialize Paddle')
      }
    }).catch((err) => {
      console.error('Paddle initialization error:', err)
      setError('Failed to initialize Paddle')
    })
  }, [])

  const handleCheckout = async () => {
    if (!paddle) {
      setError('Paddle not initialized')
      return
    }

    setLoading(true)
    setError(null)

    try {
      paddle.Checkout.open({
        items: [{
          priceId: priceId,
          quantity: 1
        }],
        customer: userEmail ? {
          email: userEmail
        } : undefined,
        customData: {
          planName,
          billingCycle
        }
      })
    } catch (error) {
      console.error('Checkout error:', error)
      setError('Failed to open checkout')
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <p className="text-red-500 text-sm">{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>{planName}</CardTitle>
        <CardDescription>
          {planPrice} / {billingCycle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleCheckout} 
          disabled={!paddle || loading}
          className="w-full"
        >
          {loading ? 'Processing...' : `Subscribe to ${planName}`}
        </Button>
      </CardContent>
    </Card>
  )
}