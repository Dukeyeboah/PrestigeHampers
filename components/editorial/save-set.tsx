'use client';
import {useState} from 'react';
import {Bookmark} from 'lucide-react';
import {useSavedProducts} from '@/hooks/use-saved-products';
import {useAuth} from '@/lib/auth-context';
import {LoginDialog} from '@/components/login-dialog';
export function SaveSet({id}:{id:string}){const {user}=useAuth();const {isSaved,toggleSave,loading}=useSavedProducts();const [login,setLogin]=useState(false);return <><button className='save-set' disabled={loading} aria-label={isSaved(id)?'Remove from saved':'Save for later'} onClick={()=>user?toggleSave(id):setLogin(true)}><Bookmark size={18} fill={isSaved(id)?'currentColor':'none'}/></button><LoginDialog open={login} onOpenChange={setLogin}/></>;}
