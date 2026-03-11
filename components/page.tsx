import Head from 'next/head'
import Appbar from '@/components/appbar'
import BottomNav from '@/components/bottom-nav'

interface Props {
	title?: string
	children: React.ReactNode
	user?: any
	setUser: (user: any) => void
	selectedAccount?: string | null
	setSelectedAccount: (account: string | null) => void
}

const Page = ({ title, children, user, setUser, selectedAccount, setSelectedAccount }: Props) => (
	<>
		{title ? (
			<Head>
				<title>Rice Bowl | {title}</title>
			</Head>
		) : null}

		<Appbar user={user} setUser={setUser} selectedAccount={selectedAccount} setSelectedAccount={setSelectedAccount} />

		<main
			/**
			 * Padding top = `appbar` height
			 * Padding bottom = `bottom-nav` height
			 */
			className='mx-auto max-w-screen-md pt-20 pb-16 px-safe sm:pb-0'
		>
			<div className='p-6'>{children}</div>
		</main>

		<BottomNav />
	</>
)

export default Page
