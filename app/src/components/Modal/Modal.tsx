import './Modal.css'

interface ModalProps {
    size?: string;
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
}

function Modal({ size = 'md', isOpen, onClose, children }: ModalProps) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className={`modal-content ${size}`} onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-button" onClick={onClose}>
                    &times;
                </button>
                {children}
            </div>
        </div>

    )
}

export default Modal