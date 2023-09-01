export default function CasLayout({
    children, // will be a page or nested layout
  }: {
    children: React.ReactNode
  }) {
    return (
      <div>
        <p>shared layout</p>
        
   
        {children}
      </div>
    )
  }