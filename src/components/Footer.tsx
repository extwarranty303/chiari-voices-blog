const Footer = () => {
  return (
    <footer className="bg-gray-900/50 backdrop-blur-sm mt-auto">
        <div className="container mx-auto px-4 py-6 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Chiari Voices. All rights reserved.</p>
        </div>
    </footer>
  );
};

export default Footer;
