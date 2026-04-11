import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from './ui/button'
import { Home, PenTool, Settings } from 'lucide-react'

const BottomNav = () => {
	const router = useRouter()

	return (
		<div className='sm:hidden'>
			<nav className='fixed bottom-0 w-full border-t pb-safe' style={{ backgroundColor: 'var(--bottomnav-bg)' }}>
				<div className='mx-auto flex h-16 max-w-md items-center justify-around px-6'>
					{links.map(({ href, label, icon }) => (
						<Link
							key={label}
							href={href}
						>
							<Button
								variant={router.pathname === href ? "default" : "ghost"}
								className='h-auto p-2'
								title={label}
							>
								{icon}
							</Button>
						</Link>
					))}
				</div>
			</nav>
		</div>
	)
}

export default BottomNav

const links = [
	{
		label: 'Home',
		href: '/dashboard',
		icon: <Home size={20} />,
	},
	{
		label: 'Transactions',
		href: '/transactions',
		icon: <PenTool size={20} />,
	},
	{
		label: 'Settings',
		href: '/settings',
		icon: <Settings size={20} />,
	}
]
