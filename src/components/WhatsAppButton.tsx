import React from 'react';
import { Button } from '@/src/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface WhatsAppButtonProps {
    phone?: string;
    message?: string;
    variant?: 'default' | 'outline' | 'ghost' | 'secondary';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    className?: string;
    showLabel?: boolean;
}

export function WhatsAppButton({
    phone,
    message = '',
    variant = 'outline',
    size = 'sm',
    className = '',
    showLabel = true
}: WhatsAppButtonProps) {
    const handleWhatsAppClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevenir navegación si está en una tabla/link

        if (!phone) {
            toast.error('Este cliente no tiene teléfono guardado');
            return;
        }

        // Limpiar el teléfono de espacios, guiones, y símbolos (excepto el +)
        let cleanPhone = phone.replace(/[^\d+]/g, '');

        // Si no tiene prefijo internacional (comienza con +), asumimos Argentina (+54)
        if (!cleanPhone.startsWith('+')) {
            // Ejemplo básico, podría requerir lógica más compleja para otros países
            if (cleanPhone.startsWith('0')) {
                cleanPhone = '+549' + cleanPhone.substring(1);
            } else {
                cleanPhone = '+549' + cleanPhone;
            }
        }

        const encodedMessage = encodeURIComponent(message);
        const waUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;

        window.open(waUrl, '_blank');
    };

    return (
        <Button
            variant={variant}
            size={size}
            className={`gap-2 ${className}`}
            onClick={handleWhatsAppClick}
            title={!phone ? "Cliente sin teléfono registrado" : "Notificar por WhatsApp"}
        >
            <MessageCircle className={`h-4 w-4 ${phone ? 'text-green-600 dark:text-green-500' : 'text-zinc-400'}`} />
            {showLabel && <span className="hidden xs:inline">{phone ? 'WhatsApp' : 'Sin Tél'}</span>}
        </Button>
    );
}
