'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useRouter } from 'next/router'
import * as d3 from 'd3'
import { sankey, sankeyLinkHorizontal } from 'd3-sankey'


interface Transaction {
  id: string
  amount: number
  category: string
  description?: string
  transaction_date: string
}

export default function Dashboard() {
  const [user, setUser] = useState<any>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const router = useRouter()

  const sankeyRef = useRef<SVGSVGElement | null>(null)


  // --- Fetch current user ---
  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push('/login')
      } else {
        setUser(data.user)
        fetchTransactions(data.user.id)
      }
    }

    getUser()
  }, [])

  // --- Fetch transactions for current user ---
  const fetchTransactions = async (userId: string) => {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('transaction_date', { ascending: false })

    if (error) {
      console.error(error)
    } else {
      setTransactions(data)
    }
  }

  // --- Add a new transaction ---
  const addTransaction = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    const { data, error } = await supabase.from('transactions').insert([
      {
        user_id: user.id,
        amount: parseFloat(amount),
        category,
        description,
      },
    ])

    if (error) {
      console.error(error)
      alert('Failed to add transaction')
    } else {
      // Clear form and refresh list
      setAmount('')
      setCategory('')
      setDescription('')
      fetchTransactions(user.id)
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

    // --- Dummy Sankey Chart ---
  useEffect(() => {
    if (!sankeyRef.current) return

    const svg = d3.select(sankeyRef.current)
    svg.selectAll('*').remove()

    const width = 600
    const height = 300

    const sankeyData = {
      nodes: [
        { name: 'Income' },
        { name: 'Rent' },
        { name: 'Food' },
        { name: 'Savings' },
      ],
      links: [
        { source: 0, target: 1, value: 500 },
        { source: 0, target: 2, value: 300 },
        { source: 0, target: 3, value: 200 },
      ],
    }

    interface SankeyNode {
  name: string
}

interface SankeyLink {
  source: number
  target: number
  value: number
}
  
const sankeyGenerator = sankey<SankeyNode, SankeyLink>()
  .nodeWidth(20)
  .nodePadding(10)
  .extent([[0, 0], [width, height]])

const { nodes, links } = sankeyGenerator(JSON.parse(JSON.stringify(sankeyData)))
    // Links
    svg
      .append('g')
      .selectAll('path')
      .data(links)
      .join('path')
      .attr('d', sankeyLinkHorizontal())
      .attr('stroke', '#4f46e5')
      .attr('stroke-width', d => Math.max(1, d.width))
      .attr('fill', 'none')
      .attr('opacity', 0.5)

    // Nodes
    const node = svg
      .append('g')
      .selectAll('rect')
      .data(nodes)
      .join('rect')
      .attr('x', d => d.x0)
      .attr('y', d => d.y0)
      .attr('height', d => d.y1 - d.y0)
      .attr('width', d => d.x1 - d.x0)
      .attr('fill', '#6366f1')

    // Node labels
    svg
      .append('g')
      .selectAll('text')
      .data(nodes)
      .join('text')
      .attr('x', d => d.x0 - 6)
      .attr('y', d => (d.y1 + d.y0) / 2)
      .attr('text-anchor', 'end')
      .attr('alignment-baseline', 'middle')
      .text(d => d.name)
      .attr('fill', '#000')
  }, [])


  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p>Welcome {user?.email}</p>

      <button
        onClick={logout}
        className="bg-red-600 text-white p-2 mt-4 rounded"
      >
        Logout
      </button>

      {/* --- Add Transaction Form --- */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Add Transaction</h2>
        <form onSubmit={addTransaction} className="mt-2 flex flex-col gap-2 max-w-sm">
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="border p-2 rounded"
            required
          />
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="border p-2 rounded"
          />
          <button type="submit" className="bg-green-600 text-white p-2 rounded">
            Add
          </button>
        </form>
      </div>

      {/* --- Transaction List --- */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold">Your Transactions</h2>
        {transactions.length === 0 ? (
          <p className="mt-2 text-gray-600">No transactions yet</p>
        ) : (
          <ul className="mt-2 space-y-1">
            {transactions.map((t) => (
              <li key={t.id} className="border p-2 rounded">
                <strong>{t.category}</strong>: ${t.amount.toFixed(2)}{' '}
                {t.description && `— ${t.description}`}
              </li>
            ))}
          </ul>
        )}
      </div>
       {/* Sankey Chart */}
        <div className="bg-white p-6 rounded shadow mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Transactions Sankey (Dummy)</h2>
          <svg ref={sankeyRef} width={600} height={300}></svg>
        </div>
    </div>
  )
}


