'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Transaction } from '@/lib/types'
import { useAuth } from '@/lib/auth-context'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown, Wallet as WalletIcon, AlertCircle } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

export default function WalletPage() {
  const { user, setUser } = useAuth()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddingFunds, setIsAddingFunds] = useState(false)
  const [addAmount, setAddAmount] = useState('100')

  useEffect(() => {
    fetchTransactions()
  }, [user])

  const fetchTransactions = async () => {
    if (!user) return
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setTransactions(data || [])
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFunds = async () => {
    if (!user || !addAmount || parseFloat(addAmount) <= 0) {
      alert('Please enter a valid amount')
      return
    }

    setIsAddingFunds(true)

    try {
      const newBalance = user.wallet_balance + parseFloat(addAmount)

      // Update user wallet
      await supabase.from('users').update({ wallet_balance: newBalance }).eq('id', user.id)

      // Record transaction
      await supabase.from('transactions').insert([
        {
          user_id: user.id,
          amount: parseFloat(addAmount),
          type: 'credit',
          description: 'Wallet top-up',
        },
      ])

      // Update local state
      const updatedUser = { ...user, wallet_balance: newBalance }
      localStorage.setItem('carpoolUser', JSON.stringify(updatedUser))
      setUser(updatedUser)

      setAddAmount('100')
      alert('Funds added successfully!')
      fetchTransactions()
    } catch (error: any) {
      alert('Error adding funds: ' + error.message)
    } finally {
      setIsAddingFunds(false)
    }
  }

  const totalCredit = transactions
    .filter((t) => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0)
  const totalDebit = transactions
    .filter((t) => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">My Wallet</h1>
        <p className="text-foreground/60">Manage your wallet and view transaction history</p>
      </div>

      {/* Balance Card */}
      <Card className="mb-6 bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20">
        <CardContent className="pt-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-foreground/60 mb-2">Current Balance</p>
              <h2 className="text-4xl font-bold">₹{user?.wallet_balance.toFixed(2) || '0.00'}</h2>
              <div className="mt-4 text-sm space-y-1">
                <p className="text-green-600">
                  <span className="font-semibold">Credits:</span> ₹{totalCredit.toFixed(2)}
                </p>
                <p className="text-red-600">
                  <span className="font-semibold">Debits:</span> ₹{totalDebit.toFixed(2)}
                </p>
              </div>
            </div>
            <div className="text-primary/40">
              <WalletIcon size={80} />
            </div>
          </div>

          <Dialog>
            <DialogTrigger asChild>
              <Button className="w-full mt-6">Add Funds to Wallet</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Funds to Wallet</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="amount">Amount (₹)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100"
                    value={addAmount}
                    onChange={(e) => setAddAmount(e.target.value)}
                    min="10"
                  />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {[100, 200, 500, 1000].map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      size="sm"
                      onClick={() => setAddAmount(amount.toString())}
                    >
                      ₹{amount}
                    </Button>
                  ))}
                </div>

                <div className="bg-blue-50 p-3 rounded text-xs text-foreground/70">
                  <p className="font-semibold mb-1">Note:</p>
                  <p>This is a demo. In production, this would integrate with a payment gateway.</p>
                </div>

                <Button
                  onClick={handleAddFunds}
                  disabled={isAddingFunds}
                  className="w-full"
                >
                  {isAddingFunds ? 'Processing...' : 'Add Funds'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>All wallet transactions and ride payments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-8">Loading transactions...</p>
          ) : transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {transaction.type === 'credit' ? (
                      <div className="p-2 bg-green-100 rounded-full">
                        <ArrowDown className="text-green-600" size={20} />
                      </div>
                    ) : (
                      <div className="p-2 bg-red-100 rounded-full">
                        <ArrowUp className="text-red-600" size={20} />
                      </div>
                    )}
                    <div>
                      <p className="font-semibold text-sm">{transaction.description}</p>
                      <p className="text-xs text-foreground/60">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <p
                      className={`font-semibold text-lg ${
                        transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'credit' ? '+' : '-'}₹{transaction.amount.toFixed(2)}
                    </p>
                    <Badge variant={transaction.type === 'credit' ? 'default' : 'secondary'}>
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="mx-auto mb-3 text-foreground/40" size={32} />
              <p className="text-foreground/60">No transactions yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
