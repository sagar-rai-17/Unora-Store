import React, { useState } from "react";
import { Icon } from "./Icons";

export interface UnoraStudioProps {
  onAddToBag?: (itemName: string, quantity: number, price: number, customizedText: string) => void;
  add?: (item: {
    name: string;
    basePrice: number;
    customFee: number;
    customText: string;
    size: string;
    quantity: number;
  }) => void;
}

export const UnoraStudio: React.FC<UnoraStudioProps> = ({ onAddToBag, add }) => {
  const [text, setText] = useState("IIT DELHI");
  const [color, setColor] = useState("#FFF8F0");
  const [style, setStyle] = useState("Varsity Block");
  const [size, setSize] = useState("L");
  const [qty, setQty] = useState(1);

  const colors = [
    ["#FFF8F0", "Off-white"],
    ["#3C1A11", "Dark brown"],
    ["#2952CC", "Royal blue"],
    ["#F6B39E", "Soft peach"],
  ];

  const handleAdd = () => {
    if (add) {
      add({
        name: "Campus Custom Hoodie",
        basePrice: 1499,
        customFee: 299,
        customText: text,
        size,
        quantity: qty,
      });
    } else if (onAddToBag) {
      onAddToBag("Campus Custom Hoodie", qty, 1798, text);
    }
  };

  return (
    <section id="unora-studio" className="studio-section">
      <div className="studio-heading section-heading">
        <div>
          <span className="eyebrow eyebrow--lime">DESIGN LAB / 01</span>
          <h2>UNORA STUDIO</h2>
        </div>
        <p>One of one, made for your campus story.</p>
      </div>

      <div className="studio-layout">
        <div className="preview-column">
          <a className="back-link" href="#gallery">
            ← Back to gallery
          </a>
          <div className="preview">
            <span className="preview__label">LIVE PREVIEW</span>
            <div className="hoodie" style={{ "--garment": color } as React.CSSProperties}>
              <div className="hoodie__hood" />
              <div className="hoodie__arm hoodie__arm--left" />
              <div className="hoodie__arm hoodie__arm--right" />
              <div className="hoodie__body">
                <span className={`print print--${style.replace(/\s+/g, "-").toLowerCase()}`}>
                  {text || "YOUR TEXT"}
                </span>
                <small>UNORA / CAMPUS DEPT.</small>
              </div>
            </div>
            <span className="preview__zoom">Drag to rotate · Pinch to zoom</span>
          </div>

          <div className="thumbs">
            <button className="active">FRONT</button>
            <button>BACK</button>
          </div>
        </div>

        <div className="customizer">
          <div className="breadcrumbs">
            UNORA STUDIO / CUSTOMIZED CAMPUS WEAR / HEAVYWEIGHT HOODIE
          </div>
          <h3>The Signature Campus Custom Hoodie</h3>
          <div className="rating">
            <span>★★★★★</span> <b>4.9</b> (124 Campus Reviews)
          </div>

          <div className="control-group">
            <label>01 / GARMENT TYPE</label>
            <div className="segmented">
              {["Hoodie", "T-Shirt", "Sweatshirt"].map((item, i) => (
                <button className={i === 0 ? "active" : ""} key={item}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>
              02 / SELECT BASE COLOR{" "}
              <span>{colors.find((c) => c[0] === color)?.[1]}</span>
            </label>
            <div className="swatches">
              {colors.map(([value, name]) => (
                <button
                  aria-label={name}
                  title={name}
                  key={value}
                  className={color === value ? "active" : ""}
                  style={{ background: value }}
                  onClick={() => setColor(value)}
                />
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>
              03 / YOUR CUSTOM TEXT <span>Campus name, department, roll no.</span>
            </label>
            <div className={`text-input ${text.length >= 15 ? "error" : ""}`}>
              <input
                id="custom-text"
                maxLength={15}
                value={text}
                onChange={(e) => setText(e.target.value.toUpperCase())}
              />
              <span>{text.length} / 15</span>
            </div>
          </div>

          <div className="control-group">
            <label>04 / CUSTOMIZATION STYLE</label>
            <div className="style-cards">
              {["Varsity Block", "Modern Sans", "Handwritten"].map((item) => (
                <button
                  key={item}
                  className={style === item ? "active" : ""}
                  onClick={() => setStyle(item)}
                >
                  <b className={`type-${item.replace(/\s+/g, "-").toLowerCase()}`}>Aa</b>
                  <span>{item}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="control-group">
            <label>
              05 / SIZE <a href="#guide">Size guide</a>
            </label>
            <div className="size-row">
              <div className="sizes">
                {["S", "M", "L", "XL", "XXL"].map((item) => (
                  <button
                    key={item}
                    className={size === item ? "active" : ""}
                    onClick={() => setSize(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="stepper">
                <button onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span>{qty}</span>
                <button onClick={() => setQty(qty + 1)}>+</button>
              </div>
            </div>
          </div>

          <div className="price-card">
            <div>
              <span>Base apparel price</span>
              <b>₹1,499.00</b>
            </div>
            <div>
              <span>Unora Studio printing</span>
              <b>₹299.00</b>
            </div>
            <hr />
            <div className="total">
              <span>Total price</span>
              <b>₹{(1798 * qty).toLocaleString("en-IN")}.00</b>
            </div>
          </div>

          <button className="add-button" onClick={handleAdd}>
            <Icon name="bag" />
            ADD TO YOUR BAG
          </button>

          <div className="trust">
            <span>
              <Icon name="check" size={12} /> Printed in 3–5 days
            </span>
            <span>
              <Icon name="check" size={12} /> Free hostel delivery
            </span>
            <span>
              <Icon name="check" size={12} /> Easy returns
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};