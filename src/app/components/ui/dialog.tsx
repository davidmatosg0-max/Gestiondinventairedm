import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

const DialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentProps<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => {
  return (
    <DialogPrimitive.Overlay
      ref={ref}
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
});

DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentProps<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Generar un ID único para la descripción
  const generatedId = React.useId();
  const descriptionId = `dialog-description-${generatedId}`;
  
  // Función recursiva mejorada para buscar DialogDescription
  const findAndCloneDescription = (nodes: React.ReactNode): { hasDescription: boolean; clonedChildren: React.ReactNode } => {
    let hasDescription = false;
    
    const clonedChildren = React.Children.map(nodes, (child) => {
      if (!React.isValidElement(child)) return child;
      
      // Si es un DialogDescription, clonarlo con el ID correcto
      if (child.type === DialogDescription || child.props?.['data-slot'] === 'dialog-description') {
        hasDescription = true;
        return React.cloneElement(child as React.ReactElement<any>, {
          id: child.props.id || descriptionId,
        });
      }
      
      // Buscar recursivamente en los children
      if (child.props?.children) {
        const result = findAndCloneDescription(child.props.children);
        if (result.hasDescription) {
          hasDescription = true;
          return React.cloneElement(child as React.ReactElement<any>, {
            children: result.clonedChildren,
          });
        }
      }
      
      return child;
    });
    
    return { hasDescription, clonedChildren };
  };
  
  // Procesar los children
  const { hasDescription, clonedChildren } = findAndCloneDescription(children);
  
  // Usar el aria-describedby proporcionado manualmente si existe, de lo contrario usar el generado
  const ariaDescribedBy = props['aria-describedby'] || (hasDescription ? descriptionId : undefined);
  
  // Crear un objeto de props limpio sin aria-describedby (lo agregaremos manualmente)
  const { 'aria-describedby': _ariaDescribedby, ...cleanedProps } = props;
  
  return (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        data-slot="dialog-content"
        aria-describedby={ariaDescribedBy}
        {...cleanedProps}
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200",
          !className?.includes("max-w-") && "max-w-[calc(100%-2rem)] sm:max-w-lg",
          className,
        )}
      >
        {clonedChildren}
        {/* Si no hay DialogDescription, agregar uno oculto por defecto */}
        {!hasDescription && (
          <span id={props['aria-describedby'] || descriptionId} className="sr-only">
            Contenido del diálogo
          </span>
        )}
        <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
          <XIcon />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPortal>
  );
});

DialogContent.displayName = "DialogContent";

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

DialogDescription.displayName = "DialogDescription";

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};