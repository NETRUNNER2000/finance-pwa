import Link from 'next/link'
import { useRouter } from 'next/router'
import { Button } from './ui/button'
import { Home, PenTool, Settings } from 'lucide-react'

const BottomNav = () => {
	const router = useRouter()

	return (
		<div className='sm:hidden'>
			<nav
				className='fixed bottom-0 w-full border-t pb-safe overflow-hidden'
				style={{
					backgroundColor: 'rgba(20, 20, 20, 0.4)',
					backdropFilter: 'blur(8px) brightness(1.05)',
					WebkitBackdropFilter: 'blur(8px) brightness(1.05)',
					background: `
						radial-gradient(ellipse 150% 150% at 50% 130%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
						rgba(20, 20, 20, 0.4)
					`,
					borderColor: 'rgba(255, 255, 255, 0.08)',
					boxShadow: `
						0 -4px 16px -8px rgba(0, 0, 0, 0.7),
						inset 0 1px 3px rgba(255, 255, 255, 0.2),
						inset 0 -1px 3px rgba(0, 0, 0, 0.5)
					`,
					borderTopLeftRadius: '20px',
					borderTopRightRadius: '20px',
				}}
			>
				<div
					style={{
						position: 'absolute',
						bottom: 0,
						left: '50%',
						transform: 'translateX(-50%)',
						width: '95%',
						height: '3px',
						background: `
							linear-gradient(90deg,
								transparent 0%,
								rgba(255, 255, 255, 0.15) 25%,
								rgba(255, 255, 255, 0.35) 50%,
								rgba(255, 255, 255, 0.15) 75%,
								transparent 100%
							)
						`,
						borderRadius: '50%',
						filter: 'blur(0.5px)',
					}}
				/>
				<div
					className='mx-auto flex h-16 max-w-md items-center justify-around px-6 relative'
					style={{
						background: `
							radial-gradient(ellipse 180% 120% at 50% 110%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.03) 35%, transparent 70%),
							transparent
						`,
					}}
				>
					{links.map(({ href, label, icon }) => (
						<Link
							key={label}
							href={href}
						>
							<Button
								variant="ghost"
								className='h-auto p-2'
								title={label}
								style={router.pathname === href ? {
									color: '#3b82f6',
									filter: 'drop-shadow(0 0 8px rgba(255, 255, 255, 0.6))'
								} : {}}
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
