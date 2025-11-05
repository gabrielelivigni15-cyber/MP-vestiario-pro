import React from 'react'
export function Button({children,onClick,type='button',className='',variant='solid'}){
  const cls = variant==='ghost' ? 'btn ghost' : 'btn'
  return <button type={type} onClick={onClick} className={`${cls} ${className}`}>{children}</button>
}
export default Button
